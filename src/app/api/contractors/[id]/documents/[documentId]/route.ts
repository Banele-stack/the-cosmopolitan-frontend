import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function DELETE(
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
    apiRes = await fetch(`${API_URL}/contractors/${id}/documents/${documentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: `Could not reach the CompliancePro API at ${API_URL}.` },
      { status: 502 },
    );
  }

  if (apiRes.status === 204 || apiRes.status === 200) {
    return NextResponse.json({ ok: true });
  }
  const body = await apiRes.json().catch(() => ({}));
  return NextResponse.json(body, { status: apiRes.status });
}
