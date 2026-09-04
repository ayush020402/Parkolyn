import Razorpay from "razorpay";

let client;

// Lazily constructed singleton — throws clearly if env vars are missing
// instead of failing at import time (which would break `next build`).
export function getRazorpay() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
      );
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}
