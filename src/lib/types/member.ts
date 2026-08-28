export type MemberRole = "admin" | "member";
export type MemberStatus = "active" | "invited";

/** A user belonging to the current session's organization — teammate, not tenant. */
export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string; // ISO datetime
}
