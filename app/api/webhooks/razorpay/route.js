import { after, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid, sendOrderEmailsOnce } from "@/lib/orders";

// Razorpay -> our server, independent of the customer's browser. Configure in
// Razorpay Dashboard -> Settings -> Webhooks:
//   URL:    https://<your-domain>/api/webhooks/razorpay
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET
//   Events: payment.captured
//
// Status codes matter: Razorpay retries any non-2xx response for up to 24h.
// So we return 5xx only for transient failures (database down) and 2xx for
// anything a retry can't fix (unknown order, unrelated event, amount mismatch).

export async function POST(request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  // The signature covers the exact raw bytes, so read text — never re-serialise JSON.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event?.event !== "payment.captured") {
    return NextResponse.json({ received: true, ignored: event?.event ?? "unknown" });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id) {
    return NextResponse.json({ error: "Malformed payment payload." }, { status: 400 });
  }

  try {
    const { order, outcome } = await markOrderPaid({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amountPaise: payment.amount,
      currency: payment.currency,
    });

    if (outcome === "not_found") {
      console.warn(`[webhook] payment ${payment.id} is for unknown order ${payment.order_id}; ignoring.`);
    } else if (outcome === "mismatch") {
      console.error(
        `[webhook] payment ${payment.id} amount ${payment.amount} ${payment.currency} does not match order ${order.order_ref}; NOT marked paid.`
      );
    } else {
      after(() => sendOrderEmailsOnce(order));
    }
  } catch (err) {
    console.error("[webhook] database error, asking Razorpay to retry:", err?.message ?? err);
    return NextResponse.json({ error: "Temporary failure." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
