// Create an admin account, or reset one's password.
//
//   npm run admin:create -- you@example.com                # generates a strong password and prints it once
//   npm run admin:create -- you@example.com "my password"  # or choose your own (12+ characters)
//   npm run admin:create -- you@example.com --name "Ayush" # optional display name
//
// If the email already exists, its password is replaced and all of its
// sessions are signed out. Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from
// .env.local (the npm script passes --env-file for you).

import crypto from "node:crypto";
import { hashPassword, passwordProblem } from "../lib/admin/password.mjs";

const args = process.argv.slice(2);
const nameFlag = args.indexOf("--name");
const name = nameFlag >= 0 ? args.splice(nameFlag, 2)[1] : null;
const [emailArg, passwordArg] = args;

if (!emailArg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailArg)) {
  console.error('Usage: npm run admin:create -- <email> ["password"] [--name "Display Name"]');
  process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set (expected in .env.local).");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const generated = !passwordArg;
// 18 random bytes -> 24 url-safe characters: far past brute-force range.
const password = passwordArg ?? crypto.randomBytes(18).toString("base64url");
const problem = passwordProblem(password, email);
if (problem) {
  console.error(problem);
  process.exit(1);
}

// Plain fetch against Supabase's REST API (works on any Node version — no client library needed).
const base = `${process.env.SUPABASE_URL.replace(/\/+$/, "")}/rest/v1`;
async function rest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Database request failed (${res.status}): ${text.slice(0, 300)}`);
    process.exit(1);
  }
  return text ? JSON.parse(text) : null;
}

const password_hash = await hashPassword(password);
const [existing] = await rest(`admin_users?email=eq.${encodeURIComponent(email)}&select=id`);

if (existing) {
  await rest(`admin_users?id=eq.${existing.id}`, {
    method: "PATCH",
    body: { password_hash, active: true, password_changed_at: new Date().toISOString(), ...(name ? { name } : {}) },
  });
  await rest(`admin_sessions?admin_id=eq.${existing.id}`, { method: "DELETE" });
  console.log(`Password reset for ${email} (existing sessions signed out).`);
} else {
  await rest("admin_users", { method: "POST", body: { email, name, password_hash } });
  console.log(`Admin created: ${email}`);
}

if (generated) {
  console.log(`
Password (shown once — change it after first sign-in under Account):

  ${password}
`);
}
