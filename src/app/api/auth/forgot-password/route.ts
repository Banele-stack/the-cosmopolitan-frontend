import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

/** Thin proxy — no cookie involved, the backend always returns the same
 * generic message regardless of whether the email exists. */
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/auth/forgot-password`, {
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

  const responseBody = await apiRes.json().catch(() => ({}));
  return NextResponse.json(responseBody, { status: apiRes.status });
}
