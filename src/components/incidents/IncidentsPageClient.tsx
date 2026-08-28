"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ChevronRight, X } from "lucide-react";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import TableContainer from "@/components/TableContainer";
import { incidentSeverityBadge, incidentStatusBadge } from "@/lib/badges";
import { siteLabel } from "@/lib/sites";
import { formatDateShort } from "@/lib/utils";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/types";

const SEVERITY_OPTIONS: (IncidentSeverity | "All severities")[] = [
  "All severities",
  "Near Miss",
  "Minor",
  "Serious",
  "Reportable",
];

const STATUS_OPTIONS: (IncidentStatus | "All statuses")[] = [
  "All statuses",
  "Open",
  "Under Investigation",
  "Closed",
];

export default function IncidentsPageClient({ incidents }: { incidents: Incident[] }) {
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "All severities">(
    "All severities"
  );
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All statuses">("All statuses");

  const filtered = useMemo(() => {
    return [...incidents]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .filter((i) => severityFilter === "All severities" || i.severity === severityFilter)
      .filter((i) => statusFilter === "All statuses" || i.status === statusFilter);
  }, [incidents, severityFilter, statusFilter]);

  const hasActiveFilters = severityFilter !== "All severities" || statusFilter !== "All statuses";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Incident Log</h1>
        <p className="text-sm text-muted">
          {incidents.length} incidents logged across all sites, from near misses to reportable events.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="severity-filter" className="text-xs font-medium text-muted">
            Severity
          </label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | "All severities")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status-filter" className="text-xs font-medium text-muted">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "All statuses")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSeverityFilter("All severities");
              setStatusFilter("All statuses");
            }}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        )}

        <span className="ml-auto self-center text-xs text-muted">
          Showing {filtered.length} of {incidents.length}
        </span>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No incidents match your filters"
            description="Try clearing the filters or choosing a different severity and status combination."
          />
        ) : (
          <TableContainer>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Incident</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((incident) => {
                  const severityBadge = incidentSeverityBadge(incident.severity);
                  const statusBadge = incidentStatusBadge(incident.status);
                  return (
                    <tr
                      key={incident.id}
                      className="group cursor-pointer transition-colors hover:bg-surface-muted"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${incident.id}`} className="block">
                          <span className="font-medium text-foreground">{incident.title}</span>
                          <span className="block text-xs text-muted">{incident.id}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <Link href={`/incidents/${incident.id}`} className="block">
                          {siteLabel(incident.siteId)}
                          <span className="block text-xs">{incident.location}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        <Link href={`/incidents/${incident.id}`} className="block">
                          {formatDateShort(incident.date)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${incident.id}`} className="block w-fit">
                          <Badge tone={severityBadge.tone} label={severityBadge.label} icon={severityBadge.icon} />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${incident.id}`} className="block w-fit">
                          <Badge tone={statusBadge.tone} label={statusBadge.label} icon={statusBadge.icon} />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/incidents/${incident.id}`}>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted transition-colors group-hover:text-foreground" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
