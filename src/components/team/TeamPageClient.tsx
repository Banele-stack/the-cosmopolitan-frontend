"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2, UserPlus, X } from "lucide-react";
import type { OrgMember } from "@/lib/types";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

export default function TeamPageClient({
  members,
  currentUserId,
  isAdmin,
}: {
  members: OrgMember[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Team</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Everyone with access to your organization&apos;s CompliancePro account.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
          >
            <UserPlus size={15} />
            Invite teammate
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No teammates yet"
          description="Invite someone to give them access to your organization."
        />
      ) : (
        <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isSelf={member.id === currentUserId}
                  canManage={isAdmin}
                  onRemoved={() => router.refresh()}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inviteOpen && (
        <InviteMemberModal
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            setInviteOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  canManage,
  onRemoved,
}: {
  member: OrgMember;
  isSelf: boolean;
  canManage: boolean;
  onRemoved: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (
      !confirm(`Remove ${member.name} from your organization? They'll immediately lose access.`)
    ) {
      return;
    }
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/members/${member.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to remove team member.");
      }
      onRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove team member.");
      setRemoving(false);
    }
  }

  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]">
      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
        {member.name}
        {isSelf && (
          <span className="ml-1.5 text-xs font-normal text-[var(--foreground-muted)]">(you)</span>
        )}
      </td>
      <td className="px-4 py-3 text-[var(--foreground-muted)]">{member.email}</td>
      <td className="px-4 py-3">
        <Badge
          tone={member.role === "admin" ? "info" : "neutral"}
          label={member.role === "admin" ? "Admin" : "Member"}
          size="sm"
        />
      </td>
      <td className="px-4 py-3">
        <Badge
          tone={member.status === "active" ? "good" : "warning"}
          label={member.status === "active" ? "Active" : "Invited"}
          size="sm"
        />
      </td>
      <td className="px-4 py-3 text-right">
        {canManage && !isSelf && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
          >
            <Trash2 size={13} />
            {removing ? "Removing…" : "Remove"}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}

function InviteMemberModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/organizations/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? "Failed to invite team member.");
      }
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite team member.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Invite a teammate</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="invite-name" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Name
            </label>
            <input
              id="invite-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="invite-email" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Work email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "admin")}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Sending invite…" : "Send invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
