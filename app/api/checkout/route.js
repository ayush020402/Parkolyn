import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// PAYMENT GATEWAY INTEGRATION POINT
// ---------------------------------------------------------------------------
// This route currently just validates the order and returns a mock order id
// so the full checkout UX (cart -> shipping -> review -> confirmation) works
// end to end while a real payment gateway decision is pending.
//
// To go live with a real gateway:
//
//   Razorpay:
//     1. npm install razorpay
//     2. Create an order server-side with razorpay.orders.create({...})
//        and return { orderId, razorpayOrderId, amount, keyId } instead of
//        the mock response below.
//     3. On the client, open Razorpay Checkout with that order, then verify
//        the payment signature in a new /api/checkout/verify route before
//        marking the order paid.
//
//   Stripe:
//     1. npm install stripe
//     2. Create a Checkout Session or PaymentIntent server-side with the
//        cart total and redirect the client to session.url (Checkout) or
//        confirm client-side with Stripe.js (PaymentIntent).
//
// Either way: never trust a client-submitted total — recompute the amount
// from lib/products.js on the server before creating the payment order.
// ---------------------------------------------------------------------------

export async function POST(request) {
  const body = await request.json();
  const { items, customer } = body || {};

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
    return NextResponse.json({ error: "Missing shipping details." }, { status: 400 });
  }

  const orderId = `PARK-${Date.now().toString(36).toUpperCase()}`;

  // TODO: persist the order (DB), send confirmation email, and — once a
  // gateway is chosen — replace this mock response with a real payment
  // order/session as described above.

  return NextResponse.json({ orderId, status: "pending_gateway_setup" });
}
