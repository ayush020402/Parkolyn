// Shared by the proxy (optimistic redirect) and the auth layer. No server-only
// imports — the proxy runs before any of that is available.

// `__Host-` locks the cookie to this exact host over HTTPS (no Domain, Path=/,
// Secure), so a sibling subdomain can't overwrite it. It requires Secure, which
// plain-http localhost can't do reliably, so dev uses a plain name.
export const ADMIN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-parkolyn_admin" : "parkolyn_admin";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // hard limit: 8h after sign-in
export const SESSION_IDLE_SECONDS = 2 * 60 * 60; //    …or 2h without any activity

export const LOGIN_PATH = "/admin/login";

// After sign-in we send the user back where they were going — but only ever to
// a path inside /admin, so the login page can't be used as an open redirect.
export function safeAdminPath(value) {
  const v = typeof value === "string" ? value : "";
  if (/^\/admin(\/[A-Za-z0-9\-._~/?=&%]*)?$/.test(v) && !v.includes("//") && !v.startsWith(LOGIN_PATH)) return v;
  return "/admin";
}
