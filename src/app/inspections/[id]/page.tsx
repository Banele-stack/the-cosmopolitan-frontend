import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  User,
  Clock,
  CalendarDays,
  ShieldAlert,
  StickyNote,
} from "lucide-react";
import Badge from "@/components/Badge";
import { inspectionResultBadge, checklistStatusBadge, defectStatusBadge } from "@/lib/badges";
import { getIncidentById, getInspectionById } from "@/lib/api";
import { siteLabel } from "@/lib/sites";
import { formatDate } from "@/lib/utils";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = await getInspectionById(id);

  if (!inspection) {
    notFound();
  }

  const resultBadge = inspectionResultBadge(inspection.result);

  const linkedIncidentIds = inspection.defects
    .map((d) => d.linkedIncidentId)
    .filter((v): v is string => Boolean(v));
  const linkedIncidents = await Promise.all(linkedIncidentIds.map((id) => getIncidentById(id)));
  const linkedIncidentById = new Map(
    linkedIncidents.filter((i) => i !== undefined).map((i) => [i.id, i])
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/inspections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Back to inspections
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{inspection.id}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {inspection.equipmentName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {inspection.equipmentType} &middot; Asset {inspection.equipmentId}
          </p>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">{siteLabel(inspection.siteId)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <User className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">{inspection.inspectorName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">{inspection.shift} shift</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">{formatDate(inspection.date)}</span>
            </div>
          </dl>
        </div>

        <Badge tone={resultBadge.tone} label={resultBadge.label} icon={resultBadge.icon} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Checklist results</h2>
        </div>
        <ul className="divide-y divide-border">
          {inspection.checklist.map((checkItem) => {
            const badge = checklistStatusBadge(checkItem.status);
            return (
              <li
                key={checkItem.id}
                className="flex flex-col gap-2 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{checkItem.label}</p>
                  {checkItem.note ? <p className="mt-0.5 text-xs text-muted">{checkItem.note}</p> : null}
                </div>
                <Badge tone={badge.tone} label={badge.label} icon={badge.icon} />
              </li>
            );
          })}
        </ul>
      </div>

      {inspection.notes ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <StickyNote className="h-4 w-4" strokeWidth={2.25} />
            Inspector notes
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{inspection.notes}</p>
        </div>
      ) : null}

      {inspection.defects.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--status-critical-text)" }}>
            <ShieldAlert className="h-4 w-4" strokeWidth={2.25} />
            Flagged defects
          </h2>
          <div className="mt-4 space-y-4">
            {inspection.defects.map((defect) => {
              const linkedIncident = defect.linkedIncidentId
                ? linkedIncidentById.get(defect.linkedIncidentId)
                : undefined;
              const badge = defectStatusBadge(defect.status);
              return (
                <div key={defect.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{defect.checklistItemLabel}</p>
                    <Badge tone={badge.tone} label={`Follow-up: ${badge.label}`} icon={badge.icon} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{defect.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    Raised by {defect.raisedBy} on {formatDate(defect.raisedDate)}
                  </p>
                  {linkedIncident ? (
                    <Link
                      href={`/incidents/${linkedIncident.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-accent hover:underline"
                    >
                      View linked incident — {linkedIncident.id}
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
