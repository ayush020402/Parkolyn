// Turns what a customer types into "Track my order" into a lookup key.
// Plain ESM with no imports so it can be unit-tested from Node directly.
//
// KEEP IN SYNC with public.phone_key() in supabase/migrations/004_phone_key.sql:
// the database computes orders.customer_phone_key with the same rules, and the
// lookup only matches if both sides normalise a number identically.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian mobile numbers only (this store ships within India and takes INR):
//   9811111111 · 09811111111 · 919811111111 · +91 98111-11111 · 0091 98111 11111  ->  "9811111111"
// Anything else — wrong length, a foreign country code, a number not starting
// 6-9 — returns null rather than being truncated to "the last 10 digits", which
// would match an unrelated customer whose number merely ends the same way.
export function indianMobileKey(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (/^[6-9][0-9]{9}$/.test(digits)) return digits;
  const withPrefix = digits.match(/^(?:0|91|0091)([6-9][0-9]{9})$/);
  return withPrefix ? withPrefix[1] : null;
}

// -> { type: "email" | "phone", value } or null if it is neither.
export function parseIdentifier(raw) {
  const input = String(raw ?? "").trim().slice(0, 254);
  if (input.includes("@")) {
    const email = input.toLowerCase();
    return EMAIL_RE.test(email) ? { type: "email", value: email } : null;
  }
  const key = indianMobileKey(input);
  return key ? { type: "phone", value: key } : null;
}
