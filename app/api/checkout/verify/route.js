import crypto from "crypto";
import { after, NextResponse } from "next/server";
import { signaturesMatch } from "@/lib/razorpay";
import { markOrderPaid, sendOrderEmailsOnce } from "@/lib/orders";

// Verifies the HMAC-SHA256 signature Razorpay returns after a successful
// Checkout payment. Only a signature that matches proves the payment is
// genuine — never trust razorpay_payment_id alone. On success the order is
// marked paid and the confirmation emails are queued. This is the fast path;
// the Razorpay webhook (/api/webhooks/razorpay) is the reliable backstop for
// when the customer's browser closes before reaching this route.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Payment gateway is not configured." }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, razorpay_signature)) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  // The payment is genuine, so always tell the customer it worked — even if
  // our database hiccups here, the webhook will finish the job.
  try {
    const { order, outcome } = await markOrderPaid({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    if (order && outcome === "paid") {
      after(() => sendOrderEmailsOnce(order));
    } else {
      console.error(`[verify] payment ${razorpay_payment_id} verified but order not marked paid (${outcome}).`);
    }
  } catch (err) {
    console.error("[verify] could not mark order paid; relying on webhook:", err?.message ?? err);
  }

  return NextResponse.json({ verified: true });
}
