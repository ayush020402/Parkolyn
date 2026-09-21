import "server-only";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabase";

// Public "Track my order" lookups: an email address or mobile number in, that
// customer's paid orders out.
//
// Because anyone can type in any email or number, what comes back is kept to
// what the customer needs to follow their parcel — order reference, items,
// total, status and courier/AWB. NEVER the street address, email, phone, name,
// notes or internal ids. Lookups are rate-limited per IP and per identifier, and
// the identifier is stored only as a SHA-256 hash.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_IDENTIFIER = 10;
const MAX_ORDERS = 20;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "9811111111", "+91 98111-11111", "098111 11111" -> { type: "phone", value: "9811111111" }
export function parseIdentifier(raw) {
  const input = String(raw ?? "").trim().slice(0, 254);
  if (input.includes("@")) {
    const email = input.toLowerCase();
    return EMAIL_RE.test(email) ? { type: "email", value: email } : null;
  }
  const digits = input.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return { type: "phone", value: digits.slice(-10) };
}

async function clientIp() {
  const h = await headers();
  return (h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 64);
}

// The customer-facing shape of an order. Anything not listed here can't leak.
function toPublicOrder(o) {
  const cancelled = o.status === "cancelled";
  return {
    ref: o.order_ref,
    placedAt: o.created_at,
    total: Number(o.amount),
    items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty })),
    // "awaiting_payment" can't occur here (only paid orders are returned).
    stage: cancelled ? "cancelled" : o.status,
    refunded: o.payment_status === "refunded",
    courier: o.courier_name ?? null,
    awb: o.awb_number ?? null,
    trackingUrl: o.tracking_url ?? null,
    shippedAt: o.shipped_at ?? null,
    deliveredAt: o.delivered_at ?? null,
  };
}

// Returns { orders } | { error, code }.
export async function lookupOrders(rawIdentifier) {
  const id = parseIdentifier(rawIdentifier);
  if (!id) {
    return { code: "invalid", error: "Enter the email address or 10-digit mobile number you used at checkout." };
  }

  const db = getSupabase();
  const ip = await clientIp();
  const keyHash = crypto.createHash("sha256").update(`${id.type}:${id.value}`).digest("hex");
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  // Keep the log small.
  await db.from("tracking_lookups").delete().lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const [byIp, byKey] = await Promise.all([
    db.from("tracking_lookups").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since),
    db.from("tracking_lookups").select("id", { count: "exact", head: true }).eq("key_hash", keyHash).gte("created_at", since),
  ]);
  if ((byIp.count ?? 0) >= MAX_PER_IP || (byKey.count ?? 0) >= MAX_PER_IDENTIFIER) {
    return { code: "rate_limited", error: "Too many lookups in a short time. Please wait a few minutes and try again." };
  }
  await db.from("tracking_lookups").insert({ ip, key_hash: keyHash });

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
