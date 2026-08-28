import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

/**
 * Streams the actual certificate file back through to the browser. A plain
 * <a href> can't attach an Authorization header, and the backend
 * deliberately doesn't expose an unauthenticated static file mount for
 * these (see compliance-pro-api's storage/ notes) — so this Route Handler
 * is what actually carries the session cookie's token over to the
 * Authorization header the API requires.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/contractors/${id}/documents/${documentId}/file`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the CompliancePro API at ${API_URL}.` },
      { status: 502 },
    );
  }

  if (!apiRes.ok) {
    const body = await apiRes.json().catch(() => ({ message: "File not found." }));
    return NextResponse.json(body, { status: apiRes.status });
  }

  return new NextResponse(apiRes.body, {
    status: 200,
    headers: {
      "Content-Type": apiRes.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": apiRes.headers.get("content-disposition") ?? "inline",
    },
  });
}
