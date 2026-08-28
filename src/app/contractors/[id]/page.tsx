import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Award,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { getContractorById } from "@/lib/api";
import { getContractorStatus } from "@/lib/status";
import { formatDate, formatZar } from "@/lib/utils";
import { documentStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import DocumentChecklist from "@/components/contractors/DocumentChecklist";
import ActivityTimeline from "@/components/contractors/ActivityTimeline";
import { RegionWorkforcePanel, RegionActivityPanel } from "@/components/contractors/SiteCrossLinks";

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contractor = await getContractorById(id);
  if (!contractor) notFound();

  const status = getContractorStatus(contractor);
  const badge = documentStatusBadge(status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/contractors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft size={15} />
        Back to contractors
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Building2 size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {contractor.companyName}
              </h1>
              <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
            </div>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {contractor.tradeType} contractor &middot; Contract ref. {contractor.contractReference}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {contractor.regions.join(", ")}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {contractor.contactPerson} &mdash; {contractor.contactTitle}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} />
                {contractor.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {contractor.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Award size={13} /> B-BBEE Level
          </p>
          <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
            Level {contractor.bbeeLevel}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Wallet size={13} /> Annual Contract Value
          </p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {formatZar(contractor.contractValueZar)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <CalendarDays size={13} /> Onboarded
          </p>
          <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
            {formatDate(contractor.onboardedDate)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            <Building2 size={13} /> Documents on File
          </p>
          <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">
            {contractor.documents.length}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
          SHEQ Document Checklist
        </h2>
        <DocumentChecklist contractorId={contractor.id} documents={contractor.documents} />
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">Mine Workforce at this Region</h2>
        <p className="mb-3 text-sm text-[var(--foreground-muted)]">
          Permanent mine employees stationed at {contractor.regions.join(", ")} — for SHEQ visibility across
          everyone working the site, contractor and mine staff alike.
        </p>
        <RegionWorkforcePanel regions={contractor.regions} />
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">Recent Site Activity</h2>
        <p className="mb-3 text-sm text-[var(--foreground-muted)]">
          Latest equipment inspections and incidents logged at {contractor.regions.join(", ")}.
        </p>
        <RegionActivityPanel regions={contractor.regions} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">Activity History</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <ActivityTimeline entries={contractor.activity} />
        </div>
      </div>
    </div>
  );
}
