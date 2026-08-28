import { NextRequest, NextResponse } from "next/server";
import { createInspection, type CreateInspectionInput } from "@/lib/api";

/**
 * Route Handlers run server-side, so this is where createInspection (from
 * the server-only @/lib/api) actually belongs — inspections/new/page.tsx is
 * a "use client" form and can't import a server-only module directly
 * (Next's build fails outright on that, it isn't just a lint warning). The
 * client form posts JSON here instead; this forwards to compliance-pro-api
 * with the session's token attached the same way every other server-side
 * fetch in this app does.
 */
export async function POST(req: NextRequest) {
  let body: CreateInspectionInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const inspection = await createInspection(body);
    return NextResponse.json(inspection, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create inspection.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
