"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, Check, FileWarning } from "lucide-react";
import { formatDate, formatDaysRemaining } from "@/lib/utils";
import { documentStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import type { DocumentWithContractor } from "@/lib/types";

const TABS = [
  { days: 30, label: "Next 30 Days" },
  { days: 60, label: "Next 60 Days" },
  { days: 90, label: "Next 90 Days" },
] as const;

export default function ExpiringDocumentsPageClient({
  allDocuments,
}: {
  allDocuments: DocumentWithContractor[];
}) {
  const [tab, setTab] = useState<number>(30);
  const [remindersSent, setRemindersSent] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      allDocuments
        .filter((d) => d.daysRemaining <= tab)
        .sort((a, b) => a.daysRemaining - b.daysRemaining),
    [allDocuments, tab]
  );

  const overdueCount = filtered.filter((d) => d.daysRemaining < 0).length;

  const sendReminder = (docId: string) => {
    setRemindersSent((prev) => new Set(prev).add(docId));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Expiring Documents
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Every SHEQ document across all contractors due for renewal, including anything already
          overdue.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.days}
            type="button"
            onClick={() => setTab(t.days)}
            className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.days
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-1 text-xs text-[var(--foreground-muted)]">
          {filtered.length} document{filtered.length === 1 ? "" : "s"}
          {overdueCount > 0 && (
            <>
              {" "}
              &middot;{" "}
              <span style={{ color: "var(--status-critical-text)" }}>
                {overdueCount} already overdue
              </span>
            </>
          )}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="Nothing due in this window"
          description="No documents across any contractor expire within this timeframe."
        />
      ) : (
        <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Contractor</th>
                <th className="px-4 py-3 font-medium">Document</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Remaining</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const sent = remindersSent.has(doc.id);
                const badge = documentStatusBadge(doc.status);
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contractors/${doc.contractorId}`}
                        className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        {doc.contractorName}
                      </Link>
                      <p className="text-xs text-[var(--foreground-muted)]">{doc.contractorTrade}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{doc.type}</td>
                    <td className="px-4 py-3">
                      <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(doc.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        style={{
                          color:
                            doc.daysRemaining < 0
                              ? "var(--status-critical-text)"
                              : doc.daysRemaining <= 30
                              ? "var(--status-warning-text)"
                              : "var(--foreground-muted)",
                        }}
                      >
                        {formatDaysRemaining(doc.daysRemaining)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={sent}
                        onClick={() => sendReminder(doc.id)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          sent
                            ? "border border-[var(--status-good-border)] bg-[var(--status-good-bg)] text-[var(--status-good-text)]"
                            : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                        }`}
                      >
                        {sent ? <Check size={13} /> : <BellRing size={13} />}
                        {sent ? "Reminder Sent" : "Send Reminder"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
