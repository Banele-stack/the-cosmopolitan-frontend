import { NextRequest, NextResponse } from "next/server";
import { apiErrorMessage, apiErrorStatus, removeMember } from "@/lib/api";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await removeMember(id);
    return NextResponse.json(result);
  } catch (err) {
    // Real, expected cases here (not just server trouble): removing
    // yourself, or removing an org's last remaining admin — both 400s
    // from OrganizationsService that should read like a form error.
    return NextResponse.json(
      { message: apiErrorMessage(err, "Failed to remove team member.") },
      { status: apiErrorStatus(err) },
    );
  }
}
