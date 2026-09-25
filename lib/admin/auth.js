import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/client-ip";
import { getSupabase } from "@/lib/supabase";
import { getDummyHash, hashPassword, passwordProblem, verifyPassword } from "@/lib/admin/password.mjs";
import { ADMIN_COOKIE, LOGIN_PATH, SESSION_IDLE_SECONDS, SESSION_MAX_AGE_SECONDS } from "@/lib/admin/constants";

// Admin authentication.
//
//  * Sessions are random 256-bit tokens. Only their SHA-256 is stored, so a
//    database leak can't be replayed as cookies, and signing out / changing the
//    password revokes a session for real (delete the row).
//  * Cookie: HttpOnly, Secure (prod), SameSite=Lax, __Host- prefixed (prod).
//  * Sessions die after 8h, or 2h of inactivity — whichever comes first.
//  * Failed sign-ins are counted per email and per IP; past the limit the
//    account/IP is locked out for the rest of the 15-minute window.
//  * Server Actions also enforce a same-origin check (built into Next.js).

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 8;
const MAX_FAILS_PER_IP = 12;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

async function clientInfo() {
  const h = await headers();
  return { ip: await getClientIp(), userAgent: (h.get("user-agent") || "").slice(0, 300) };
}

// ------------------------------------------------------------------ sign in

export async function signIn({ email, password }) {
  const db = getSupabase();
  const { ip, userAgent } = await clientInfo();
  const normalizedEmail = String(email ?? "").trim().toLowerCase().slice(0, 254);
  const pw = typeof password === "string" ? password.slice(0, 200) : "";

  // Housekeeping so these tables never grow unbounded.
  const nowIso = new Date().toISOString();
  await db.from("admin_sessions").delete().lt("expires_at", nowIso);
  await db
    .from("admin_login_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Lockout. The attempt is RECORDED FIRST (as a failure) and only then counted, so a
  // burst of parallel guesses can't all read "0 failures so far" and each get verified:
  // request N always sees at least N rows, so at most MAX_FAILS of them are ever checked
  // against the password. A correct password flips its own row to success afterwards.
  // It also FAILS CLOSED — if the log can't be written or read, sign-in is refused.
  const unavailable = { error: "Sign-in is temporarily unavailable. Please try again in a moment." };
  const { data: attempt, error: attemptError } = await db
    .from("admin_login_attempts")
    .insert({ email: normalizedEmail, ip, success: false })
    .select("id")
    .single();
  if (attemptError) {
    console.error("[admin] could not record sign-in attempt:", attemptError.message);
    return unavailable;
  }

  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString();
  const [byEmail, byIp] = await Promise.all([
    db
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .eq("success", false)
      .gte("created_at", since),
    db
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("success", false)
      .gte("created_at", since),
  ]);
  if (byEmail.error || byIp.error) {
    console.error("[admin] lockout check failed:", (byEmail.error || byIp.error).message);
    return unavailable;
  }
  if (byEmail.count > MAX_FAILS_PER_EMAIL || byIp.count > MAX_FAILS_PER_IP) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  }

  const { data: admin } = await db
    .from("admin_users")
    .select("id, email, name, password_hash, active")
    .eq("email", normalizedEmail)
    .maybeSingle();

  // Always run one scrypt verification (against a dummy hash if there's no such
  // admin) so timing doesn't reveal whether an email is registered.
  const passwordOk = await verifyPassword(pw, admin?.password_hash ?? (await getDummyHash()));
  const ok = Boolean(admin?.active) && passwordOk;
  if (!ok) return { error: "Incorrect email or password." };

  await db.from("admin_login_attempts").update({ success: true }).eq("id", attempt.id);
  await createSession(admin.id, { ip, userAgent });
  await db.from("admin_users").update({ last_login_at: nowIso }).eq("id", admin.id);
  return { ok: true };
}

async function createSession(adminId, { ip, userAgent }) {
  const token = crypto.randomBytes(32).toString("base64url");
  const { error } = await getSupabase()
    .from("admin_sessions")
    .insert({
      admin_id: adminId,
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
      ip,
      user_agent: userAgent,
    });
  if (error) throw error;

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

// ------------------------------------------------------- reading the session

// Validates the cookie against the database. Cached for the duration of one
// request so calling it from a layout, a page and a data function costs one query.
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token.length > 200) return null;

  const db = getSupabase();
  const { data: session } = await db
    .from("admin_sessions")
    .select("id, expires_at, last_seen_at, admin:admin_users(id, email, name, active, last_login_at)")
    .eq("token_hash", sha256(token))
    .maybeSingle();
  if (!session || !session.admin?.active) return null;

  const now = Date.now();
  const expired = new Date(session.expires_at).getTime() <= now;
  const idle = now - new Date(session.last_seen_at).getTime() > SESSION_IDLE_SECONDS * 1000;
  if (expired || idle) {
    await db.from("admin_sessions").delete().eq("id", session.id);
    return null;
  }

  if (now - new Date(session.last_seen_at).getTime() > TOUCH_INTERVAL_MS) {
    await db.from("admin_sessions").update({ last_seen_at: new Date(now).toISOString() }).eq("id", session.id);
  }

  return {
    id: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    lastLoginAt: session.admin.last_login_at,
    sessionId: session.id,
  };
});

// Use at the top of every admin page, Server Action and Route Handler. Data
// functions in lib/admin/data.js call it too, so admin data can't be read or
// written without a valid session even if a caller forgets.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

// For Route Handlers, where a redirect is the wrong answer to a bad session.
export async function getAdminOrNull() {
  return getAdmin();
}

// ------------------------------------------------------------------ sign out

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) await getSupabase().from("admin_sessions").delete().eq("token_hash", sha256(token));
  jar.delete(ADMIN_COOKIE);
}

export async function signOutOtherSessions(admin) {
  await getSupabase().from("admin_sessions").delete().eq("admin_id", admin.id).neq("id", admin.sessionId);
}

export async function listSessions(admin) {
  const { data } = await getSupabase()
    .from("admin_sessions")
    .select("id, created_at, last_seen_at, ip, user_agent")
    .eq("admin_id", admin.id)
    .gt("expires_at", new Date().toISOString())
    .order("last_seen_at", { ascending: false });
  return (data ?? []).map((s) => ({ ...s, current: s.id === admin.sessionId }));
}

// ----------------------------------------------------------- change password

export async function changePassword(admin, { current, next, confirm }) {
  if (next !== confirm) return { error: "The new passwords don't match." };
  const problem = passwordProblem(next, admin.email);
  if (problem) return { error: problem };

  const db = getSupabase();
  const { data: row } = await db.from("admin_users").select("password_hash").eq("id", admin.id).maybeSingle();
  if (!row || !(await verifyPassword(String(current ?? ""), row.password_hash))) {
    return { error: "Your current password is incorrect." };
  }
  if (await verifyPassword(next, row.password_hash)) {
    return { error: "Choose a password different from your current one." };
  }

  const { error } = await db
    .from("admin_users")
    .update({ password_hash: await hashPassword(next), password_changed_at: new Date().toISOString() })
    .eq("id", admin.id);
  if (error) return { error: "Could not update the password. Please try again." };

  // A password change ends every other session (e.g. one left open somewhere).
  await signOutOtherSessions(admin);
  return { ok: true };
}
