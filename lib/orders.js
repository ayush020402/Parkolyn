import { getSupabase } from "@/lib/supabase";
import {
  getOwnerEmail,
  isEmailConfigured,
  newOrderAlertEmail,
  orderConfirmationEmail,
  sendEmail,
} from "@/lib/email";

// Order persistence + payment finalisation.
//
// A payment can be confirmed by TWO independent paths: the browser calling
// /api/checkout/verify, and Razorpay's server calling the webhook. Both end
// up in markOrderPaid() / sendOrderEmailsOnce(), which are safe to call any
// number of times, in any order, concurrently — the order is marked paid once
// and each email is sent once.

export async function createPendingOrder(order) {
  const { error } = await getSupabase().from("orders").insert({ ...order, status: "pending" });
  if (error) throw error;
}

// Returns { order, outcome } where outcome is one of:
//   "not_found"  — no such order in our DB (e.g. a payment made outside the site)
//   "mismatch"   — amount/currency doesn't match what we created (not marked paid)
//   "paid"       — order is now (or already was) paid
export async function markOrderPaid({ razorpayOrderId, razorpayPaymentId, amountPaise, currency }) {
  const db = getSupabase();

  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error) throw error;
  if (!order) return { order: null, outcome: "not_found" };

  // Only the webhook knows the captured amount; the browser path passes none.
  if (
    (amountPaise != null && amountPaise !== order.amount_paise) ||
    (currency != null && currency !== order.currency)
  ) {
    return { order, outcome: "mismatch" };
  }

  if (order.status === "paid") return { order, outcome: "paid" };

  // Guarded on status='pending' so a concurrent caller can't overwrite us.
  const { data: updated, error: updateError } = await db
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "pending")
    .select()
    .maybeSingle();
  if (updateError) throw updateError;

  // `updated` is null if another request won the race — it's paid either way.
  return { order: updated ?? { ...order, status: "paid" }, outcome: "paid" };
}

// Sends the customer confirmation + owner alert exactly once per order.
// Never throws — callers run this inside after(), where an exception would
// have nowhere to go. On failure the claim is released so the other payment
// path (browser verify / webhook) can retry, and the row stays visible in the
// DB as `status = 'paid' and emails_sent_at is null`.
export async function sendOrderEmailsOnce(order) {
  if (!isEmailConfigured()) {
    console.warn(`[orders] RESEND_API_KEY not set — skipping emails for ${order.order_ref}.`);
    return;
  }

  const db = getSupabase();
  try {
    // Atomic claim: only one caller gets a row back.
    const { data: claimed, error } = await db
      .from("orders")
      .update({ emails_sent_at: new Date().toISOString() })
      .eq("id", order.id)
      .is("emails_sent_at", null)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!claimed) return; // already sent (or being sent) by the other path

    const ownerEmail = getOwnerEmail();
    const customer = orderConfirmationEmail(claimed);
    const alert = newOrderAlertEmail(claimed);

    const results = await Promise.allSettled([
      sendEmail({
        to: claimed.customer_email,
        ...customer,
        replyTo: ownerEmail || undefined,
        idempotencyKey: `order-confirmation-${claimed.id}`,
      }),
      ownerEmail
        ? sendEmail({
            to: ownerEmail,
            ...alert,
            replyTo: claimed.customer_email,
            idempotencyKey: `order-alert-${claimed.id}`,
          })
        : Promise.reject(new Error("ORDER_ALERT_EMAIL is not set.")),
    ]);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      await db.from("orders").update({ emails_sent_at: null }).eq("id", claimed.id);
      for (const f of failures) {
        console.error(`[orders] email failed for ${claimed.order_ref}:`, f.reason?.message ?? f.reason);
      }
    }
  } catch (err) {
    console.error(`[orders] could not send emails for ${order.order_ref}:`, err?.message ?? err);
  }
}
