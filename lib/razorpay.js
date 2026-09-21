import crypto from "crypto";
import Razorpay from "razorpay";

let client;

// Constant-time comparison of two hex signature strings.
export function signaturesMatch(expected, received) {
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(received));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Razorpay signs the raw webhook body with HMAC-SHA256 using the webhook
// secret (set in Dashboard -> Webhooks) and sends it as X-Razorpay-Signature.
export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signaturesMatch(expected, signature);
}

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
