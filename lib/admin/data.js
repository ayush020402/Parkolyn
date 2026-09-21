import "server-only";
import { getSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin/auth";
import { ACTIVE_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABELS, allowedNextStatuses } from "@/lib/order-status";
import { orderConfirmationEmail, getOwnerEmail, isEmailConfigured, orderShippedEmail, sendEmail } from "@/lib/email";
import { logOrderEvent } from "@/lib/orders";

// Everything the admin panel reads or writes. Every export starts with
// requireAdmin(), so no admin data is reachable without a valid session — the
// pages/actions call it too (it's cached per request, so it costs nothing).

export const PAGE_SIZE = 25;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => typeof v === "string" && UUID_RE.test(v);

// Strip characters that have meaning in PostgREST filter syntax / LIKE patterns,
// so a search box can't be used to inject filter clauses.
const cleanTerm = (value, max = 80) =>
  String(value ?? "")
    .replace(/[%_,()*\\"'`;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const LIST_COLUMNS =
  "id, order_ref, created_at, customer_name, customer_email, customer_phone, shipping_city, shipping_state, " +
  "amount, items, payment_status, status, courier_name, awb_number";

// IST calendar day boundaries for the date filters.
const dayStart = (d) => `${d}T00:00:00+05:30`;
const dayEnd = (d) => `${d}T23:59:59.999+05:30`;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ------------------------------------------------------------------- filters

export function normalizeOrderFilters(sp = {}) {
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  const payment = one(sp.payment);
  const status = one(sp.status);
  const page = Number.parseInt(one(sp.page), 10);
  return {
    q: cleanTerm(one(sp.q)),
    // Default to paid orders — unpaid checkouts are mostly abandoned carts.
    payment: payment === "all" || PAYMENT_STATUSES.includes(payment) ? payment : "paid",
    status: ORDER_STATUSES.includes(status) ? status : "all",
    city: cleanTerm(one(sp.city)),
    courier: isUuid(one(sp.courier)) ? one(sp.courier) : "",
    from: DATE_RE.test(one(sp.from) ?? "") ? one(sp.from) : "",
    to: DATE_RE.test(one(sp.to) ?? "") ? one(sp.to) : "",
    sort: one(sp.sort) === "oldest" ? "oldest" : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function applyOrderFilters(query, f) {
  if (f.payment !== "all") query = query.eq("payment_status", f.payment);
  if (f.status !== "all") query = query.eq("status", f.status);
  if (f.city) query = query.ilike("shipping_city", `%${f.city}%`);
  if (f.courier) query = query.eq("courier_id", f.courier);
  if (f.from) query = query.gte("created_at", dayStart(f.from));
  if (f.to) query = query.lte("created_at", dayEnd(f.to));
  if (f.q) {
    const t = `*${f.q}*`;
    query = query.or(
      [
        `order_ref.ilike.${t}`,
        `customer_name.ilike.${t}`,
        `customer_email.ilike.${t}`,
        `customer_phone.ilike.${t}`,
        `awb_number.ilike.${t}`,
        `razorpay_payment_id.ilike.${t}`,
      ].join(",")
    );
  }
  return query.order("created_at", { ascending: f.sort === "oldest" });
}

// -------------------------------------------------------------------- orders

export async function listOrders(filters) {
  await requireAdmin();
  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, count, error } = await applyOrderFilters(
    getSupabase().from("orders").select(LIST_COLUMNS, { count: "exact" }),
    filters
  ).range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0, page: filters.page, pageSize: PAGE_SIZE };
}

// Every matching order (capped) with all columns — for the CSV export.
export async function listOrdersForExport(filters) {
  await requireAdmin();
  const { data, error } = await applyOrderFilters(getSupabase().from("orders").select("*"), filters).limit(5000);
  if (error) throw error;
  return data ?? [];
}

export async function getOrder(id) {
  await requireAdmin();
  if (!isUuid(id)) return null;
  const { data, error } = await getSupabase().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrderEvents(id) {
  await requireAdmin();
  const { data } = await getSupabase()
    .from("order_events")
    .select("id, message, actor, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listCities() {
  await requireAdmin();
  const { data } = await getSupabase().from("orders").select("shipping_city").not("shipping_city", "is", null).limit(5000);
  const seen = new Map();
  for (const { shipping_city } of data ?? []) {
    const key = shipping_city.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, shipping_city.trim());
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

// Guarded update: only applies if the order is still in the state the admin
// was looking at, so two people (or two tabs) can't silently overwrite each other.
async function updateOrderIf(order, patch) {
  const { data, error } = await getSupabase()
    .from("orders")
    .update(patch)
    .eq("id", order.id)
    .eq("status", order.status)
    .eq("payment_status", order.payment_status)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data; // null => the order changed underneath us
}

const STALE = { error: "This order was just changed elsewhere. Refresh the page and try again." };

export async function changeOrderStatus(id, nextStatus, note) {
  const admin = await requireAdmin();
  const order = await getOrder(id);
  if (!order) return { error: "Order not found." };
  if (!allowedNextStatuses(order).includes(nextStatus)) {
    return { error: `An order that is "${STATUS_LABELS[order.status]}" can't be moved to "${STATUS_LABELS[nextStatus] ?? nextStatus}".` };
  }
  if (nextStatus === "shipped" && (!order.courier_name || !order.awb_number)) {
    return { error: "Add the courier and AWB number in the Shipping box first — that also marks it shipped." };
  }

  const now = new Date().toISOString();
  const patch = { status: nextStatus };
  if (nextStatus === "shipped" && !order.shipped_at) patch.shipped_at = now;
  if (nextStatus === "delivered") patch.delivered_at = now;
  if (nextStatus === "cancelled") patch.cancelled_at = now;
  // Stepping backwards clears the timestamps that no longer apply.
  if (["confirmed", "processing", "awaiting_payment"].includes(nextStatus)) {
    patch.shipped_at = null;
    patch.delivered_at = null;
    patch.cancelled_at = null;
  }
  if (nextStatus === "shipped") {
    patch.delivered_at = null;
    patch.cancelled_at = null;
  }

  const updated = await updateOrderIf(order, patch);
  if (!updated) return STALE;

  const trimmed = String(note ?? "").trim().slice(0, 500);
  await logOrderEvent(
    order.id,
    `Status changed: ${STATUS_LABELS[order.status]} → ${STATUS_LABELS[nextStatus]}${trimmed ? ` — ${trimmed}` : ""}`,
    admin.email
  );
  return { ok: true, message: `Status updated to ${STATUS_LABELS[nextStatus]}.` };
}

const AWB_RE = /^[A-Z0-9][A-Z0-9\-/]{3,39}$/;

export async function saveShipping(id, { courierId, awb, markShipped, notify }) {
  const admin = await requireAdmin();
  const order = await getOrder(id);
  if (!order) return { error: "Order not found." };
  if (order.payment_status !== "paid" || !["confirmed", "processing", "shipped", "delivered"].includes(order.status)) {
    return { error: "Shipping details can only be added to a paid order that hasn't been cancelled." };
  }

  const awbClean = String(awb ?? "").replace(/\s+/g, "").toUpperCase();
  if (!isUuid(courierId)) return { error: "Choose a courier from the list." };
  if (!AWB_RE.test(awbClean)) {
    return { error: "Enter a valid AWB / tracking number (4–40 letters, digits, - or /)." };
  }

  const { data: courier } = await getSupabase().from("couriers").select("*").eq("id", courierId).maybeSingle();
  if (!courier) return { error: "That courier no longer exists. Pick another." };
  if (!courier.active && courier.id !== order.courier_id) {
    return { error: `${courier.name} is switched off in the courier list. Enable it or pick another.` };
  }

  const trackingUrl = courier.tracking_url_template
    ? courier.tracking_url_template.replace(/\{awb\}/gi, encodeURIComponent(awbClean))
    : null;

  const alreadyShipped = ["shipped", "delivered"].includes(order.status);
  const patch = { courier_id: courier.id, courier_name: courier.name, awb_number: awbClean, tracking_url: trackingUrl };
  const shipNow = markShipped && !alreadyShipped;
  if (shipNow) {
    patch.status = "shipped";
    patch.shipped_at = new Date().toISOString();
  }

  const updated = await updateOrderIf(order, patch);
  if (!updated) return STALE;

  const changed = order.awb_number !== awbClean || order.courier_id !== courier.id;
  await logOrderEvent(
    order.id,
    shipNow
      ? `Shipped via ${courier.name}, AWB ${awbClean}`
      : changed
        ? `Shipping details ${order.awb_number ? "updated" : "saved"}: ${courier.name}, AWB ${awbClean}`
        : `Shipping details re-saved (${courier.name}, AWB ${awbClean})`,
    admin.email
  );

  // Tell the customer when it ships, or when the tracking details of an
  // already-shipped order change.
  let emailNote = "";
  if (notify && (shipNow || (alreadyShipped && changed))) {
    if (!isEmailConfigured()) {
      emailNote = " Customer not emailed (email isn't configured).";
    } else {
      try {
        await sendEmail({
          to: updated.customer_email,
          ...orderShippedEmail(updated),
          replyTo: getOwnerEmail() || undefined,
          idempotencyKey: `order-shipped-${updated.id}-${awbClean}`,
        });
        await logOrderEvent(order.id, `Shipping email sent to ${updated.customer_email}`, admin.email);
        emailNote = " Customer emailed the tracking details.";
      } catch (err) {
        console.error("[admin] shipped email failed:", err?.message ?? err);
        await logOrderEvent(order.id, "Shipping email FAILED to send", admin.email);
        emailNote = " ⚠ The customer email could not be sent — see server logs.";
      }
    }
  }

  return { ok: true, message: `${shipNow ? "Marked as shipped." : "Shipping details saved."}${emailNote}` };
}

export async function saveAdminNotes(id, notes) {
  const admin = await requireAdmin();
  if (!isUuid(id)) return { error: "Order not found." };
  const value = String(notes ?? "").trim().slice(0, 2000);
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ admin_notes: value || null })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return { error: "Could not save the note." };
  await logOrderEvent(id, value ? "Internal note updated" : "Internal note cleared", admin.email);
  return { ok: true, message: "Note saved." };
}

export async function markRefunded(id) {
  const admin = await requireAdmin();
  const order = await getOrder(id);
  if (!order) return { error: "Order not found." };
  if (order.payment_status !== "paid" || order.status !== "cancelled") {
    return { error: "Only a paid, cancelled order can be marked as refunded." };
  }
  const updated = await updateOrderIf(order, { payment_status: "refunded" });
  if (!updated) return STALE;
  await logOrderEvent(order.id, "Marked as refunded (refund itself is issued from the Razorpay dashboard)", admin.email);
  return { ok: true, message: "Marked as refunded." };
}

export async function resendConfirmation(id) {
  const admin = await requireAdmin();
  const order = await getOrder(id);
  if (!order) return { error: "Order not found." };
  if (order.payment_status === "pending") return { error: "This order hasn't been paid yet." };
  if (!isEmailConfigured()) return { error: "Email isn't configured." };
  try {
    await sendEmail({
      to: order.customer_email,
      ...orderConfirmationEmail(order),
      replyTo: getOwnerEmail() || undefined,
      idempotencyKey: `order-confirmation-resend-${order.id}-${Date.now()}`,
    });
  } catch (err) {
    console.error("[admin] resend confirmation failed:", err?.message ?? err);
    return { error: `Could not send: ${String(err?.message ?? err).slice(0, 160)}` };
  }
  await logOrderEvent(order.id, `Confirmation email re-sent to ${order.customer_email}`, admin.email);
  return { ok: true, message: `Confirmation sent to ${order.customer_email}.` };
}

// ----------------------------------------------------------------- dashboard

export async function getDashboard() {
  await requireAdmin();
  const db = getSupabase();

  const [paid, unpaid, needsAction, recent] = await Promise.all([
    db.from("orders").select("amount, status, created_at").eq("payment_status", "paid").limit(20000),
    db.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending").neq("status", "cancelled"),
    db
      .from("orders")
      .select(LIST_COLUMNS)
      .eq("payment_status", "paid")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: true })
      .limit(8),
    db.from("orders").select(LIST_COLUMNS).eq("payment_status", "paid").order("created_at", { ascending: false }).limit(8),
  ]);

  const rows = paid.data ?? [];
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  let revenue = 0;
  let revenue30 = 0;
  let orders30 = 0;
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const r of rows) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    if (r.status === "cancelled") continue; // cancelled-but-paid awaits refund; not revenue
    revenue += Number(r.amount);
    if (new Date(r.created_at).getTime() >= cutoff) {
      revenue30 += Number(r.amount);
      orders30 += 1;
    }
  }

  return {
    revenue,
    revenue30,
    orders30,
    counts,
    toShip: counts.confirmed + counts.processing,
    unpaid: unpaid.count ?? 0,
    needsAction: needsAction.data ?? [],
    recent: recent.data ?? [],
  };
}

// Small numbers shown as badges in the sidebar.
export async function getNavCounts() {
  await requireAdmin();
  const db = getSupabase();
  const [toShip, messages] = await Promise.all([
    db.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "paid").in("status", ACTIVE_STATUSES),
    db.from("contact_messages").select("id", { count: "exact", head: true }).is("handled_at", null),
  ]);
  return { toShip: toShip.count ?? 0, messages: messages.count ?? 0 };
}

// ------------------------------------------------------------------ couriers

export async function listCouriers({ activeOnly = false } = {}) {
  await requireAdmin();
  const db = getSupabase();
  let q = db.from("couriers").select("*").order("name", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const [{ data: couriers }, { data: used }] = await Promise.all([
    q,
    db.from("orders").select("courier_id").not("courier_id", "is", null).limit(20000),
  ]);
  const usage = new Map();
  for (const { courier_id } of used ?? []) usage.set(courier_id, (usage.get(courier_id) ?? 0) + 1);
  return (couriers ?? []).map((c) => ({ ...c, orderCount: usage.get(c.id) ?? 0 }));
}

function validateCourier({ name, trackingUrlTemplate }) {
  const cleanName = String(name ?? "").replace(/\s+/g, " ").trim();
  if (cleanName.length < 2 || cleanName.length > 60) return { error: "Courier name must be 2–60 characters." };
  const template = String(trackingUrlTemplate ?? "").trim();
  if (template) {
    if (template.length > 300 || !/^https:\/\//i.test(template)) return { error: "Tracking link must start with https://" };
    if (!/\{awb\}/i.test(template)) return { error: "Tracking link must contain {awb} where the tracking number goes." };
  }
  return { name: cleanName, tracking_url_template: template || null };
}

export async function createCourier(input) {
  await requireAdmin();
  const v = validateCourier(input);
  if (v.error) return v;
  const { error } = await getSupabase().from("couriers").insert({ name: v.name, tracking_url_template: v.tracking_url_template });
  if (error) return { error: error.code === "23505" ? `"${v.name}" is already in the list.` : "Could not add the courier." };
  return { ok: true, message: `${v.name} added.` };
}

export async function updateCourier(id, input) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Courier not found." };
  const v = validateCourier(input);
  if (v.error) return v;
  const { data, error } = await getSupabase()
    .from("couriers")
    .update({ name: v.name, tracking_url_template: v.tracking_url_template })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.code === "23505" ? `"${v.name}" is already in the list.` : "Could not save the courier." };
  if (!data) return { error: "Courier not found." };
  return { ok: true, message: "Courier saved. (Orders already shipped keep the name and link they were shipped with.)" };
}

export async function setCourierActive(id, active) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Courier not found." };
  const { error } = await getSupabase().from("couriers").update({ active: Boolean(active) }).eq("id", id);
  return error ? { error: "Could not update the courier." } : { ok: true };
}

export async function deleteCourier(id) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Courier not found." };
  const { count } = await getSupabase().from("orders").select("id", { count: "exact", head: true }).eq("courier_id", id);
  if ((count ?? 0) > 0) {
    return { error: `This courier is used on ${count} order${count === 1 ? "" : "s"}, so it can't be deleted. Switch it off instead.` };
  }
  const { error } = await getSupabase().from("couriers").delete().eq("id", id);
  return error ? { error: "Could not delete the courier." } : { ok: true };
}

// ----------------------------------------------- subscribers & contact inbox

export async function listSubscribers() {
  await requireAdmin();
  const { data, count } = await getSupabase()
    .from("subscribers")
    .select("id, email, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5000);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function deleteSubscriber(id) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Subscriber not found." };
  const { error } = await getSupabase().from("subscribers").delete().eq("id", id);
  return error ? { error: "Could not remove the subscriber." } : { ok: true };
}

export async function listMessages() {
  await requireAdmin();
  const { data } = await getSupabase()
    .from("contact_messages")
    .select("id, name, email, message, created_at, handled_at")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}

export async function setMessageHandled(id, handled) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Message not found." };
  const { error } = await getSupabase()
    .from("contact_messages")
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  return error ? { error: "Could not update the message." } : { ok: true };
}

export async function deleteMessage(id) {
  await requireAdmin();
  if (!isUuid(id)) return { error: "Message not found." };
  const { error } = await getSupabase().from("contact_messages").delete().eq("id", id);
  return error ? { error: "Could not delete the message." } : { ok: true };
}
