import type { Metadata } from "next";
import WorkersExplorer, { type WorkerRow } from "@/components/workers/WorkersExplorer";
import { getWorkers, getCertifications } from "@/lib/api";
import { computeWorkerOverallStatus } from "@/lib/status";
import { ROLES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Workers — CompliancePro",
};

export default async function WorkersPage() {
  const [workers, certifications] = await Promise.all([getWorkers(), getCertifications()]);
  const rows: WorkerRow[] = workers.map((worker) => ({
    worker,
    overallStatus: computeWorkerOverallStatus(certifications.filter((c) => c.workerId === worker.id)),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Workers</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Search and filter the workforce by site, role and certification status.
        </p>
      </div>
      <div className="mt-6">
        <WorkersExplorer rows={rows} roles={ROLES} />
      </div>
    </div>
  );
}
