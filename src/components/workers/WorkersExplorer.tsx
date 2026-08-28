"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { workerStatusBadge } from "@/lib/badges";
import { getSiteById, siteLabel } from "@/lib/sites";
import type { Worker, WorkerOverallStatus } from "@/lib/types";

const STATUS_OPTIONS: WorkerOverallStatus[] = ["Fully Certified", "Expiring Soon", "Non-Compliant"];

export interface WorkerRow {
  worker: Worker;
  overallStatus: WorkerOverallStatus;
}

interface WorkersExplorerProps {
  rows: WorkerRow[];
  roles: string[];
}

export default function WorkersExplorer({ rows, roles }: WorkersExplorerProps) {
  const [query, setQuery] = useState("");
  const [siteId, setSiteId] = useState<string>("All sites");
  const [role, setRole] = useState<string>("All roles");
  const [status, setStatus] = useState<string>("All statuses");

  const siteIds = useMemo(() => Array.from(new Set(rows.map((r) => r.worker.siteId))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ worker, overallStatus }) => {
      if (q && !worker.name.toLowerCase().includes(q) && !worker.employeeNumber.toLowerCase().includes(q)) {
        return false;
      }
      if (siteId !== "All sites" && worker.siteId !== siteId) return false;
      if (role !== "All roles" && worker.role !== role) return false;
      if (status !== "All statuses" && overallStatus !== status) return false;
      return true;
    });
  }, [rows, query, siteId, role, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or employee number"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option>All sites</option>
          {siteIds.map((id) => (
            <option key={id} value={id}>
              {getSiteById(id)?.name ?? id}
            </option>
          ))}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option>All roles</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
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
          {filtered.length} of {rows.length} workers
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState icon={Search} title="No workers match your filters" description="Try adjusting the search term or filters above." />
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Worker</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Employee #</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(({ worker, overallStatus }) => {
                const badge = workerStatusBadge(overallStatus);
                return (
                  <tr key={worker.id} className="transition hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3">
                      <Link href={`/workers/${worker.id}`} className="flex items-center gap-3">
                        <Avatar name={worker.name} size="sm" />
                        <span className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]">
                          {worker.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{worker.role}</td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{siteLabel(worker.siteId)}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--foreground-muted)]">{worker.employeeNumber}</td>
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
