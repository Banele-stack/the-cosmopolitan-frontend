"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, ChevronRight, X } from "lucide-react";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import TableContainer from "@/components/TableContainer";
import { inspectionResultBadge } from "@/lib/badges";
import { siteLabel } from "@/lib/sites";
import { formatDateShort } from "@/lib/utils";
import type { Inspection, InspectionResult } from "@/lib/types";

const RESULT_OPTIONS: (InspectionResult | "All results")[] = [
  "All results",
  "Pass",
  "Defect Found",
  "Pending",
];

export default function InspectionsPageClient({ inspections }: { inspections: Inspection[] }) {
  const [resultFilter, setResultFilter] = useState<InspectionResult | "All results">(
    "All results"
  );
  const [dateFilter, setDateFilter] = useState("");

  const filtered = useMemo(() => {
    return [...inspections]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .filter((i) => resultFilter === "All results" || i.result === resultFilter)
      .filter((i) => !dateFilter || i.date === dateFilter);
  }, [inspections, resultFilter, dateFilter]);

  const hasActiveFilters = resultFilter !== "All results" || dateFilter !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inspections
          </h1>
          <p className="text-sm text-muted">
            {inspections.length} pre-shift inspections logged across all sites.
          </p>
        </div>
        <Link
          href="/inspections/new"
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 sm:mt-0"
        >
          New Inspection
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="result-filter" className="text-xs font-medium text-muted">
            Result
          </label>
          <select
            id="result-filter"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as InspectionResult | "All results")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {RESULT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-filter" className="text-xs font-medium text-muted">
            Date
          </label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setResultFilter("All results");
              setDateFilter("");
            }}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        )}

        <span className="ml-auto self-center text-xs text-muted">
          Showing {filtered.length} of {inspections.length}
        </span>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No inspections match your filters"
            description="Try clearing the filters or choosing a different result and date combination."
          />
        ) : (
          <TableContainer>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Equipment / Area</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inspection) => {
                  const badge = inspectionResultBadge(inspection.result);
                  return (
                    <tr
                      key={inspection.id}
                      className="group cursor-pointer transition-colors hover:bg-surface-muted"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/inspections/${inspection.id}`} className="block">
                          <span className="font-medium text-foreground">{inspection.equipmentName}</span>
                          <span className="block text-xs text-muted">
                            {inspection.equipmentType} &middot; {inspection.equipmentId}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <Link href={`/inspections/${inspection.id}`} className="block">
                          {siteLabel(inspection.siteId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <Link href={`/inspections/${inspection.id}`} className="block">
                          {inspection.inspectorName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <Link href={`/inspections/${inspection.id}`} className="block">
                          {inspection.shift}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        <Link href={`/inspections/${inspection.id}`} className="block">
                          {formatDateShort(inspection.date)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/inspections/${inspection.id}`} className="block w-fit">
                          <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/inspections/${inspection.id}`}>
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
