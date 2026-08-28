import Link from "next/link";
import {
  Building2,
  Users,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  FileWarning,
  Wrench,
  Siren,
  type LucideIcon,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { getDashboardStats, getNeedsAttentionFeed } from "@/lib/api";

const DOMAIN_ICON: Record<string, LucideIcon> = {
  contractor: FileWarning,
  worker: Users,
  inspection: Wrench,
  incident: Siren,
};

const DOMAIN_LABEL: Record<string, string> = {
  contractor: "Contractor",
  worker: "Worker",
  inspection: "Inspection",
  incident: "Incident",
};

export default async function DashboardPage() {
  const [stats, needsAttentionFeed] = await Promise.all([getDashboardStats(), getNeedsAttentionFeed()]);
  const needsAttention = needsAttentionFeed.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Compliance Dashboard
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          One view of contractor compliance, workforce certifications and site safety across every region.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Contractors Non-Compliant"
          value={String(stats.contractorsNonCompliant)}
          icon={Building2}
          tone={stats.contractorsNonCompliant > 0 ? "critical" : "good"}
          hint={`${stats.totalContractors} contractors across 9 regions`}
          href="/contractors"
        />
        <StatCard
          label="Workers Non-Compliant"
          value={String(stats.workersNonCompliant)}
          icon={Users}
          tone={stats.workersNonCompliant > 0 ? "critical" : "good"}
          hint={`${stats.totalWorkers} mine employees tracked`}
          href="/workers"
        />
        <StatCard
          label="Open Equipment Defects"
          value={String(stats.openDefects)}
          icon={ClipboardCheck}
          tone={stats.openDefects > 0 ? "warning" : "good"}
          hint={`${stats.inspectionComplianceRate}% inspection pass rate`}
          href="/inspections"
        />
        <StatCard
          label="Open Incidents"
          value={String(stats.incidentsOpen)}
          icon={AlertTriangle}
          tone={stats.incidentsOpen > 0 ? "critical" : "good"}
          hint={`${stats.incidentsThisMonth} logged this month`}
          href="/incidents"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <ShieldAlert size={17} className="text-[var(--accent)]" />
            Needs Attention
          </h2>
          <p className="text-xs text-[var(--foreground-muted)]">
            Ranked across contractors, workforce and site safety — most urgent first.
          </p>
        </div>

        {needsAttention.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-10 text-center text-sm text-[var(--foreground-muted)]">
            Nothing needs attention right now — every contractor, worker and site is in good standing.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {needsAttention.map((item) => {
              const Icon = DOMAIN_ICON[item.domain];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)]">
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                    <p className="truncate text-xs text-[var(--foreground-muted)]">{item.subtitle}</p>
                  </div>
                  <Badge tone={item.tone} label={DOMAIN_LABEL[item.domain]} size="sm" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/contractors"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Building2 size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Contractors</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.totalContractors} vendors · {stats.contractorsExpiringSoon} documents expiring soon
          </p>
        </Link>

        <Link
          href="/workers"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Users size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Workforce</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.totalWorkers} employees · {stats.workersExpiringSoon} certifications expiring soon
          </p>
        </Link>

        <Link
          href="/inspections"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <ClipboardCheck size={18} />
            </span>
            <ArrowRight size={15} className="text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Safety</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {stats.inspectionsToday} inspections today · {stats.incidentsOpen} incidents open
          </p>
        </Link>
      </div>
    </div>
  );
}
