import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import type { Contractor } from "@/lib/types";
import { getContractorStatus, getSoonestExpiry } from "@/lib/status";
import { formatDaysRemaining, daysUntil } from "@/lib/utils";
import { documentStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";

interface ContractorsTableProps {
  contractors: Contractor[];
  emptyMessage?: string;
}

export default function ContractorsTable({ contractors, emptyMessage }: ContractorsTableProps) {
  if (contractors.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No contractors match these filters"
        description={emptyMessage ?? "Try adjusting the search term or filters above."}
      />
    );
  }

  return (
    <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
            <th className="px-4 py-3 font-medium">Contractor</th>
            <th className="px-4 py-3 font-medium">Trade</th>
            <th className="px-4 py-3 font-medium">Region(s)</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Next Document Due</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((contractor) => {
            const status = getContractorStatus(contractor);
            const badge = documentStatusBadge(status);
            const soonest = getSoonestExpiry(contractor);
            const days = daysUntil(soonest.expiryDate);
            return (
              <tr
                key={contractor.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/contractors/${contractor.id}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                  >
                    {contractor.companyName}
                  </Link>
                  <p className="text-xs text-[var(--foreground-muted)]">{contractor.contactPerson}</p>
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{contractor.tradeType}</td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">
                  {contractor.regions.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <p className="text-[var(--foreground)]">{soonest.type}</p>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        days < 0
                          ? "var(--status-critical-text)"
                          : days <= 30
                          ? "var(--status-warning-text)"
                          : "var(--foreground-muted)",
                    }}
                  >
                    {formatDaysRemaining(days)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/contractors/${contractor.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                  >
                    View
                    <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
