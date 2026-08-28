import { getMembers } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import TeamPageClient from "@/components/team/TeamPageClient";

export default async function TeamPage() {
  const [members, user] = await Promise.all([getMembers(), getCurrentUser()]);

  return (
    <TeamPageClient
      members={members}
      currentUserId={user?.id ?? ""}
      isAdmin={user?.role === "admin"}
    />
  );
}
