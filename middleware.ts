import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "cp_session";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/accept-invite"];

/**
 * Presence-only check: is there a session cookie at all. This is a UX
 * redirect, not the security boundary — the cookie's JWT is independently
 * verified (signature + expiry) by compliance-pro-api on every actual data
 * request, so a forged/expired cookie can get you redirected into the app
 * shell but never gets you real data.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/api/");
  if (isPublic) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
