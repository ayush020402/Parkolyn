import { NextResponse } from "next/server";
import { ADMIN_COOKIE, LOGIN_PATH } from "@/lib/admin/constants";

// Optimistic gate for /admin: no session cookie -> straight to the login page.
// This is NOT the security boundary — it can't tell a real session from a made-up
// cookie value. Every admin page, action and route re-validates the session
// against the database (lib/admin/auth.js -> requireAdmin) before touching data.

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === LOGIN_PATH) return NextResponse.next();

  if (!request.cookies.has(ADMIN_COOKIE)) {
    const url = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
