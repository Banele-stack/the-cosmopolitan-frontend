"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { certStatusBadge } from "@/lib/badges";
import { siteLabel } from "@/lib/sites";
import {
  CERTIFICATION_TYPES,
  type CertStatus,
  type Certification,
  type CertificationType,
  type Worker,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS: CertStatus[] = ["Valid", "Expiring Soon", "Expired", "Red-Flagged"];

type SortDir = "asc" | "desc";

export interface CertificationRow {
  cert: Certification;
  worker: Worker;
}

export default function CertificationsExplorer({ rows }: { rows: CertificationRow[] }) {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const validInitialStatus = STATUS_OPTIONS.includes(initialStatus as CertStatus) ? (initialStatus as CertStatus) : null;

  const [type, setType] = useState<string>("All types");
  const [status, setStatus] = useState<string>(validInitialStatus ?? "All statuses");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    let result = rows.filter(({ cert }) => {
      if (type !== "All types" && cert.type !== (type as CertificationType)) return false;
      if (status !== "All statuses" && cert.status !== (status as CertStatus)) return false;
      return true;
    });
    result = result.slice().sort((a, b) => {
      const cmp = a.cert.expiryDate.localeCompare(b.cert.expiryDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [rows, type, status, sortDir]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option>All types</option>
          {CERTIFICATION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option>All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <p className="text-xs text-[var(--foreground-muted)] sm:ml-auto">
          {filtered.length} of {rows.length} certifications
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState icon={ArrowDown} title="No certifications match your filters" description="Try a different type or status filter." />
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Worker</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Certification</th>
                <th className="px-4 py-3 font-medium">Issuing body</th>
                <th className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    className="flex items-center gap-1 hover:text-[var(--foreground)]"
                  >
                    Expiry date
                    {sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(({ cert, worker }) => {
                const badge = certStatusBadge(cert.status);
                return (
                  <tr key={cert.id} className="hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3">
                      <Link href={`/workers/${worker.id}`} className="flex items-center gap-3">
                        <Avatar name={worker.name} size="sm" />
                        <span className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]">
                          {worker.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{siteLabel(worker.siteId)}</td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{cert.type}</td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{cert.issuingBody}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--foreground-muted)]">{formatDate(cert.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
