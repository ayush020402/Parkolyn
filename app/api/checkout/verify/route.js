import crypto from "crypto";
import { NextResponse } from "next/server";

// Verifies the HMAC-SHA256 signature Razorpay returns after a successful
// Checkout payment. Only a signature that matches proves the payment is
// genuine — never trust razorpay_payment_id alone.

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

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(String(razorpay_signature));
  const isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!isValid) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  // TODO: once a database exists, mark the matching order as paid here and
  // store razorpay_order_id / razorpay_payment_id against it.

  return NextResponse.json({ verified: true });
}
