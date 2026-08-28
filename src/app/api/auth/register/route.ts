import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

/**
 * Proxies registration to compliance-pro-api and, on success, stores the
 * returned JWT the same way /api/auth/login does — registering creates a
 * brand new organization (tenant) plus its first admin user, and that
 * admin should land signed in, not bounced back to a login form.
 */
export async function POST(req: NextRequest) {
  let body: {
    organizationName?: string;
    name?: string;
    email?: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the CompliancePro API at ${API_URL}. Is compliance-pro-api running?` },
      { status: 502 },
    );
  }

  if (!apiRes.ok) {
    const errBody = await apiRes.json().catch(() => ({ message: "Registration failed." }));
    return NextResponse.json(errBody, { status: apiRes.status });
  }

  const { accessToken, user } = await apiRes.json();

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
