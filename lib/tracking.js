import "server-only";
import crypto from "node:crypto";
import { after } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getClientIp } from "@/lib/client-ip";
import { parseIdentifier } from "@/lib/identifier.mjs";

// Public "Track my order" lookups: an email address or Indian mobile number in,
// that customer's paid orders out.
//
// Because anyone can type in any email or number, what comes back is kept to
// what the customer needs to follow their parcel — order reference, items,
// total, status and courier/AWB. NEVER the street address, email, phone, name,
// notes or internal ids.
//
// Abuse protection (all limits are per 15-minute window):
//   * per IP, per identifier, and one global ceiling so that a botnet rotating
//     IPs still can't crawl the customer base;
//   * each lookup is RECORDED FIRST and counted second, so a burst of parallel
//     requests can't all read "0 so far" and slip past — request N always sees
//     at least N rows, so at most MAX of them can pass;
//   * it FAILS CLOSED: if the log can't be written or read (e.g. a migration
//     hasn't been applied), the lookup is refused instead of unlimited;
//   * the identifier is stored only as a SHA-256.
// The global ceiling is deliberately far above real traffic for a store this
// size; the trade-off is that a determined flood could temporarily lock everyone
// out of tracking (never out of anything else).

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_IDENTIFIER = 10;
const MAX_GLOBAL = 400;
const MAX_ORDERS = 20;
const CLEANUP_CHANCE = 0.05;

// The customer-facing shape of an order. Anything not listed here can't leak.
function toPublicOrder(o) {
  return {
    ref: o.order_ref,
    placedAt: o.created_at,
    total: Number(o.amount),
    items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty })),
    // "awaiting_payment" can't occur here (only paid orders are returned).
    stage: o.status,
    refunded: o.payment_status === "refunded",
    courier: o.courier_name ?? null,
    awb: o.awb_number ?? null,
    trackingUrl: o.tracking_url ?? null,
    shippedAt: o.shipped_at ?? null,
    deliveredAt: o.delivered_at ?? null,
  };
}

const UNAVAILABLE = { code: "error", error: "Order tracking is temporarily unavailable. Please try again in a few minutes." };

// Returns { orders, type } | { error, code }.
export async function lookupOrders(rawIdentifier) {
  const id = parseIdentifier(rawIdentifier);
  if (!id) {
    return { code: "invalid", error: "Enter the email address or 10-digit mobile number you used at checkout." };
  }

  const db = getSupabase();
  const ip = await getClientIp();
  const keyHash = crypto.createHash("sha256").update(`${id.type}:${id.value}`).digest("hex");
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  // 1. Record this lookup...
  const { error: insertError } = await db.from("tracking_lookups").insert({ ip, key_hash: keyHash });
  if (insertError) {
    console.error("[tracking] could not record lookup:", insertError.message);
    return UNAVAILABLE;
  }

  // 2. ...then count, this one included.
  const count = (column, value) => {
    let q = db.from("tracking_lookups").select("id", { count: "exact", head: true }).gte("created_at", since);
    if (column) q = q.eq(column, value);
    return q;
  };
  const [byIp, byKey, overall] = await Promise.all([count("ip", ip), count("key_hash", keyHash), count()]);
  const failed = byIp.error || byKey.error || overall.error;
  if (failed) {
    console.error("[tracking] rate-limit check failed:", failed.message);
    return UNAVAILABLE;
  }
  if (byIp.count > MAX_PER_IP || byKey.count > MAX_PER_IDENTIFIER || overall.count > MAX_GLOBAL) {
    return { code: "rate_limited", error: "Too many lookups in a short time. Please wait a few minutes and try again." };
  }

  // Housekeeping runs now and then, after the response — not on every request.
  if (Math.random() < CLEANUP_CHANCE) {
    after(async () => {
      const { error } = await db
        .from("tracking_lookups")
        .delete()
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if (error) console.error("[tracking] cleanup failed:", error.message);
    });
  }

  let query = db
    .from("orders")
    .select("order_ref, created_at, amount, items, status, payment_status, courier_name, awb_number, tracking_url, shipped_at, delivered_at")
    // Unpaid checkouts are abandoned carts, not orders.
    .neq("payment_status", "pending");
  query = id.type === "email" ? query.eq("customer_email", id.value) : query.eq("customer_phone_key", id.value);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_ORDERS);
  if (error) {
    console.error("[tracking] lookup failed:", error.message);
    return { code: "error", error: "Something went wrong on our side. Please try again in a moment." };
  }

  return { orders: (data ?? []).map(toPublicOrder), type: id.type };
}
