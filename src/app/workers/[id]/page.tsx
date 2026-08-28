import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Calendar, MapPin, Hash } from "lucide-react";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import { certsForWorker, getWorker } from "@/lib/api";
import { computeWorkerOverallStatus } from "@/lib/status";
import { workerStatusBadge, certStatusBadge } from "@/lib/badges";
import { siteLabel } from "@/lib/sites";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const worker = await getWorker(id);
  return { title: worker ? `${worker.name} — CompliancePro` : "Worker not found — CompliancePro" };
}

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worker = await getWorker(id);
  if (!worker) notFound();

  const rawCerts = await certsForWorker(worker.id);
  const certs = rawCerts.slice().sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const overallStatus = computeWorkerOverallStatus(certs);
  const overallBadge = workerStatusBadge(overallStatus);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/workers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workers
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={worker.name} size="lg" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{worker.name}</h1>
            <p className="text-sm text-[var(--foreground-muted)]">{worker.role}</p>
          </div>
        </div>
        <Badge tone={overallBadge.tone} label={overallBadge.label} icon={overallBadge.icon} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
            <Hash className="h-3.5 w-3.5" /> Employee number
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums text-[var(--foreground)]">{worker.employeeNumber}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
            <Briefcase className="h-3.5 w-3.5" /> Role
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{worker.role}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
            <MapPin className="h-3.5 w-3.5" /> Site
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{siteLabel(worker.siteId)}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
            <Calendar className="h-3.5 w-3.5" /> Start date
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{formatDate(worker.startDate)}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Certifications</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <th className="px-4 py-3 font-medium">Certification</th>
                <th className="px-4 py-3 font-medium">Issuing body</th>
                <th className="px-4 py-3 font-medium">Issue date</th>
                <th className="px-4 py-3 font-medium">Expiry date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {certs.map((cert) => {
                const badge = certStatusBadge(cert.status);
                return (
                  <tr key={cert.id} className="hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{cert.type}</td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)]">{cert.issuingBody}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--foreground-muted)]">{formatDate(cert.issueDate)}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--foreground-muted)]">{formatDate(cert.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
