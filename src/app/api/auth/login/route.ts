import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

/**
 * Proxies login to compliance-pro-api and stores the returned JWT as an
 * httpOnly cookie — the browser never holds the raw token in JS-readable
 * storage. Runs server-side only (Route Handler), same origin as the pages
 * that read the cookie back.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the CompliancePro API at ${API_URL}. Is compliance-pro-api running?` },
      { status: 502 },
    );
  }

  if (!apiRes.ok) {
    const errBody = await apiRes.json().catch(() => ({ message: "Login failed." }));
    return NextResponse.json(errBody, { status: apiRes.status });
  }

  const { accessToken, user } = await apiRes.json();

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Matches the backend's JWT_EXPIRES_IN default (12h) — the token itself
    // is still independently verified/expired server-side regardless of
    // what the cookie's own maxAge says.
    maxAge: 60 * 60 * 12,
  });
  return response;
}
