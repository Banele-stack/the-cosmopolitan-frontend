import type { Metadata } from "next";
import { Suspense } from "react";
import CertificationsExplorer, { type CertificationRow } from "@/components/workers/CertificationsExplorer";
import { getCertifications, getWorkers } from "@/lib/api";

export const metadata: Metadata = {
  title: "Certifications — CompliancePro",
};

async function CertificationsExplorerData() {
  const [certifications, workers] = await Promise.all([getCertifications(), getWorkers()]);
  const workerById = new Map(workers.map((w) => [w.id, w]));
  const rows: CertificationRow[] = certifications
    .filter((cert) => workerById.has(cert.workerId))
    .map((cert) => ({ cert, worker: workerById.get(cert.workerId)! }));

  return <CertificationsExplorer rows={rows} />;
}

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Certifications</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Every certification on record across the workforce &mdash; the operational view for scheduling this month&apos;s
          re-certifications.
        </p>
      </div>
      <div className="mt-6">
        <Suspense fallback={null}>
          <CertificationsExplorerData />
        </Suspense>
      </div>
    </div>
  );
}
