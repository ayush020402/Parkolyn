// Password hashing for admin accounts. Plain ESM (.mjs) with no imports from
// the app so both the Next.js server and scripts/create-admin.mjs can use it.
//
// scrypt (memory-hard, built into Node) — no native dependency to install.
// Stored as  scrypt$N$r$p$salt(base64)$hash(base64)  so the cost can be raised
// later without invalidating existing hashes.

import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

const N = 32768; // 2^15 -> ~32 MB, ~100 ms
const R = 8;
const P = 1;
const KEYLEN = 64;
const maxmemFor = (n, r) => 128 * n * r * 2;

export const MIN_PASSWORD_LENGTH = 12;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: maxmemFor(N, R) });
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const key = await scrypt(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: maxmemFor(Number(n), Number(r)),
    });
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

// A real hash of a random value, computed once. Verifying against it when the
// email is unknown makes "no such user" cost the same as "wrong password", so
// response time doesn't reveal which emails are admins.
let dummyHash;
export async function getDummyHash() {
  dummyHash ??= await hashPassword(crypto.randomBytes(24).toString("hex"));
  return dummyHash;
}

// Returns an error message, or null if the password is acceptable.
export function passwordProblem(password, email = "") {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 200) return "Password is too long.";
  if (new Set(password).size < 5) return "Password is too repetitive.";
  if (email && password.toLowerCase().includes(String(email).split("@")[0].toLowerCase()) && String(email).split("@")[0].length >= 4) {
    return "Password must not contain your email name.";
  }
  return null;
}
