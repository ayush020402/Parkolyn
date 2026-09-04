import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getProductBySlug } from "@/lib/products";

// Creates a Razorpay order for the current cart. The client then opens
// Razorpay Checkout with the returned order id; payment is confirmed via
// POST /api/checkout/verify (see that route for signature verification).

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, customer } = body || {};

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
    return NextResponse.json({ error: "Missing shipping details." }, { status: 400 });
  }

  // Recompute the total server-side from the product catalogue — never
  // trust a client-submitted price.
  let subtotal = 0;
  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
    }
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: `Invalid quantity for ${item.slug}.` }, { status: 400 });
    }
    subtotal += product.price * qty;
  }

  const amountInPaise = Math.round(subtotal * 100);
  if (amountInPaise < 100) {
    return NextResponse.json({ error: "Order amount is below the minimum payable amount." }, { status: 400 });
  }

  const orderId = `PARK-${Date.now().toString(36).toUpperCase()}`;

  try {
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
      notes: {
        customerName: customer.name,
        customerEmail: customer.email,
      },
    });

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const status = err?.statusCode === 401 ? 401 : 500;
    return NextResponse.json(
      {
        error:
          status === 401
            ? "Payment gateway authentication failed."
            : "Could not create payment order. Please try again.",
      },
      { status }
    );
  }
}
