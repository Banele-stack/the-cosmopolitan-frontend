import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, inviteMember, type InviteMemberInput } from "@/lib/api";

/**
 * Route Handlers run server-side, so this is where inviteMember (from the
 * server-only @/lib/api) actually belongs — the Team page's invite form is
 * a "use client" component and can't import a server-only module directly.
 * It posts JSON here instead; this forwards to compliance-pro-api with the
 * session's token attached the same way every other server-side fetch in
 * this app does (see app/api/inspections/route.ts for the same pattern).
 */
export async function POST(req: NextRequest) {
  let body: InviteMemberInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const member = await inviteMember(body);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    // A duplicate-email invite (409) is the realistic everyday case here,
    // not a server failure — surface the backend's own message and status
    // (e.g. "An account with this email already exists.") instead of a
    // generic 502, same as any other validation error would read.
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to invite team member.") },
      { status: apiErrorStatus(err) },
    );
  }
}
