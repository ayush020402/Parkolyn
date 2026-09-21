import crypto from "crypto";
import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getProductBySlug } from "@/lib/products";
import { createPendingOrder } from "@/lib/orders";
import { INDIAN_STATES, PINCODE_RE } from "@/lib/india";

// Creates a Razorpay order for the current cart and saves it in the database
// as a "pending" order (items, address, amount). The client then opens
// Razorpay Checkout with the returned order id; payment is confirmed by
// POST /api/checkout/verify (browser) and/or the Razorpay webhook at
// /api/webhooks/razorpay — whichever arrives first flips the order to "paid".

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (value, max) => String(value ?? "").trim().slice(0, max);

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
  if (
    !customer?.name ||
    !customer?.email ||
    !customer?.phone ||
    !customer?.address ||
    !customer?.city ||
    !customer?.state ||
    !customer?.pincode
  ) {
    return NextResponse.json({ error: "Missing shipping details." }, { status: 400 });
  }
  const shipping = {
    name: clip(customer.name, 120),
    email: clip(customer.email, 254).toLowerCase(),
    phone: clip(customer.phone, 30),
    address: clip(customer.address, 500),
    city: clip(customer.city, 80),
    state: clip(customer.state, 60),
    pincode: clip(customer.pincode, 6),
    notes: clip(customer.notes, 1000),
  };
  if (!EMAIL_RE.test(shipping.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!INDIAN_STATES.includes(shipping.state)) {
    return NextResponse.json({ error: "Please choose your state from the list." }, { status: 400 });
  }
  if (!PINCODE_RE.test(shipping.pincode)) {
    return NextResponse.json({ error: "Please enter a valid 6-digit PIN code." }, { status: 400 });
  }

  // Recompute the total server-side from the product catalogue — never
  // trust a client-submitted price.
  let subtotal = 0;
  const orderItems = [];
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
    orderItems.push({ slug: product.slug, name: product.name, qty, price: product.price });
  }

  const amountInPaise = Math.round(subtotal * 100);
  if (amountInPaise < 100) {
    return NextResponse.json({ error: "Order amount is below the minimum payable amount." }, { status: 400 });
  }

  const orderId = `PARK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  try {
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
      notes: {
        orderRef: orderId,
        customerName: shipping.name,
        customerEmail: shipping.email,
      },
    });

    // If this fails we must NOT let the customer pay — a paid order with no
    // saved address would be unfulfillable. The unused Razorpay order is harmless.
    await createPendingOrder({
      order_ref: orderId,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise / 100, // stored in rupees; Razorpay itself works in paise
      currency: "INR",
      items: orderItems,
      customer_name: shipping.name,
      customer_email: shipping.email,
      customer_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_pincode: shipping.pincode,
      notes: shipping.notes || null,
    });

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[checkout] could not create order:", err?.message ?? err);
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
