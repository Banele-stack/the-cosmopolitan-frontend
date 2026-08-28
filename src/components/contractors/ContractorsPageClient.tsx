"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ContractorsTable from "@/components/contractors/ContractorsTable";
import { getContractorStatus } from "@/lib/status";
import { MINING_REGIONS, type MiningRegion } from "@/lib/sites";
import type { Contractor, ComplianceStatus, TradeType } from "@/lib/types";

const STATUS_OPTIONS: ComplianceStatus[] = ["Compliant", "Expiring Soon", "Non-Compliant"];

interface ContractorsPageClientProps {
  contractors: Contractor[];
  tradeTypes: TradeType[];
}

export default function ContractorsPageClient({ contractors, tradeTypes }: ContractorsPageClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | "All">("All");
  const [tradeFilter, setTradeFilter] = useState<TradeType | "All">("All");
  const [regionFilter, setRegionFilter] = useState<MiningRegion | "All">("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contractors.filter((contractor) => {
      if (statusFilter !== "All" && getContractorStatus(contractor) !== statusFilter) {
        return false;
      }
      if (tradeFilter !== "All" && contractor.tradeType !== tradeFilter) return false;
      if (regionFilter !== "All" && !contractor.regions.includes(regionFilter)) return false;
      if (
        query &&
        !contractor.companyName.toLowerCase().includes(query) &&
        !contractor.contactPerson.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [contractors, search, statusFilter, tradeFilter, regionFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Contractors &amp; Vendors
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          {contractors.length} approved contractors across 9 regions. Search or filter to narrow the list.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or contact..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | "All")}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value as TradeType | "All")}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="All">All trades</option>
          {tradeTypes.map((trade) => (
            <option key={trade} value={trade}>
              {trade}
            </option>
          ))}
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value as MiningRegion | "All")}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="All">All regions</option>
          {MINING_REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {(search || statusFilter !== "All" || tradeFilter !== "All" || regionFilter !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setTradeFilter("All");
              setRegionFilter("All");
            }}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-[var(--foreground-muted)]">
        Showing {filtered.length} of {contractors.length} contractors
      </p>

      <ContractorsTable contractors={filtered} />
    </div>
  );
}
