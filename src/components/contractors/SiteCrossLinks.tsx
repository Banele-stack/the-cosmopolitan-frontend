import Link from "next/link";
import { Users, ClipboardCheck, AlertTriangle } from "lucide-react";
import type { MiningRegion } from "@/lib/sites";
import { siteLabel } from "@/lib/sites";
import {
  getWorkersForRegion,
  getInspectionsForRegion,
  getIncidentsForRegion,
  certsForWorker,
} from "@/lib/api";
import { computeWorkerOverallStatus } from "@/lib/status";
import { workerStatusBadge, inspectionResultBadge, incidentSeverityBadge } from "@/lib/badges";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";

/**
 * These panels are the actual point of merging the three source apps: a
 * contractor's SHEQ officer can see the mine's own workforce and recent
 * safety activity at the same region(s), not just the contractor's own
 * document trail.
 */
export async function RegionWorkforcePanel({ regions }: { regions: MiningRegion[] }) {
  const workersByRegion = await Promise.all(regions.map((region) => getWorkersForRegion(region)));
  const workers = workersByRegion.flat();

  if (workers.length === 0) {
    return (
      <EmptyState icon={Users} title="No mine employees recorded at this region yet" />
    );
  }

  const statuses = await Promise.all(
    workers.map(async (worker) => computeWorkerOverallStatus(await certsForWorker(worker.id)))
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {workers.map((worker, i) => {
        const status = statuses[i];
        const badge = workerStatusBadge(status);
        return (
          <Link
            key={worker.id}
            href={`/workers/${worker.id}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-strong)]"
          >
            <Avatar name={worker.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{worker.name}</p>
              <p className="truncate text-xs text-[var(--foreground-muted)]">{worker.role}</p>
            </div>
            <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
          </Link>
        );
      })}
    </div>
  );
}

export async function RegionActivityPanel({ regions }: { regions: MiningRegion[] }) {
  const [inspectionsByRegion, incidentsByRegion] = await Promise.all([
    Promise.all(regions.map((region) => getInspectionsForRegion(region))),
    Promise.all(regions.map((region) => getIncidentsForRegion(region))),
  ]);
  const inspections = inspectionsByRegion
    .flat()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);
  const incidents = incidentsByRegion
    .flat()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  if (inspections.length === 0 && incidents.length === 0) {
    return <EmptyState icon={ClipboardCheck} title="No inspections or incidents logged at this region yet" />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
          <ClipboardCheck size={15} /> Recent Inspections
        </h3>
        {inspections.length === 0 ? (
          <p className="text-sm text-[var(--foreground-muted)]">No inspections logged.</p>
        ) : (
          <ul className="space-y-2">
            {inspections.map((inspection) => {
              const badge = inspectionResultBadge(inspection.result);
              return (
                <li key={inspection.id}>
                  <Link
                    href={`/inspections/${inspection.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 hover:border-[var(--border-strong)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {inspection.equipmentName}
                      </p>
                      <p className="truncate text-xs text-[var(--foreground-muted)]">
                        {siteLabel(inspection.siteId)}
                      </p>
                    </div>
                    <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
          <AlertTriangle size={15} /> Recent Incidents
        </h3>
        {incidents.length === 0 ? (
          <p className="text-sm text-[var(--foreground-muted)]">No incidents logged.</p>
        ) : (
          <ul className="space-y-2">
            {incidents.map((incident) => {
              const badge = incidentSeverityBadge(incident.severity);
              return (
                <li key={incident.id}>
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 hover:border-[var(--border-strong)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{incident.title}</p>
                      <p className="truncate text-xs text-[var(--foreground-muted)]">
                        {siteLabel(incident.siteId)}
                      </p>
                    </div>
                    <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
