import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Siren,
  Search,
  ListChecks,
  ClipboardCheck,
} from "lucide-react";
import Badge from "@/components/Badge";
import { incidentSeverityBadge, incidentStatusBadge } from "@/lib/badges";
import { getIncidentById, getInspectionById } from "@/lib/api";
import { siteLabel } from "@/lib/sites";
import { formatDate } from "@/lib/utils";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await getIncidentById(id);

  if (!incident) {
    notFound();
  }

  const linkedInspection = incident.linkedInspectionId
    ? await getInspectionById(incident.linkedInspectionId)
    : undefined;
  const severityBadge = incidentSeverityBadge(incident.severity);
  const statusBadge = incidentStatusBadge(incident.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/incidents"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Back to incident log
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{incident.id}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{incident.title}</h1>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">
                {siteLabel(incident.siteId)} &mdash; {incident.location}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-foreground">{formatDate(incident.date)}</span>
            </div>
          </dl>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Badge tone={severityBadge.tone} label={severityBadge.label} icon={severityBadge.icon} />
          <Badge tone={statusBadge.tone} label={statusBadge.label} icon={statusBadge.icon} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Siren className="h-4 w-4" strokeWidth={2.25} />
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{incident.description}</p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListChecks className="h-4 w-4" strokeWidth={2.25} />
              Immediate actions taken
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{incident.immediateActions}</p>
          </section>

          {incident.rootCause ? (
            <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Search className="h-4 w-4" strokeWidth={2.25} />
                Root cause
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{incident.rootCause}</p>
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-border bg-surface-muted p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Search className="h-4 w-4" strokeWidth={2.25} />
                Root cause
              </h2>
              <p className="mt-2 text-sm text-muted">
                Root cause analysis is pending completion of the investigation.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Corrective actions</h2>
            <ul className="mt-4 space-y-3">
              {incident.correctiveActions.map((action) => {
                const badge = action.done
                  ? { tone: "good" as const, label: "Completed" }
                  : { tone: "critical" as const, label: "Outstanding" };
                return (
                  <li
                    key={action.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{action.description}</p>
                      <p className="mt-1 text-xs text-muted">
                        Owner: {action.owner} &middot; Due {formatDate(action.dueDate)}
                      </p>
                    </div>
                    <Badge tone={badge.tone} label={badge.label} />
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4" strokeWidth={2.25} />
              Persons involved
            </h2>
            <ul className="mt-3 space-y-2">
              {incident.personsInvolved.map((person) => (
                <li key={person} className="text-sm text-muted">
                  {person}
                </li>
              ))}
            </ul>
          </section>

          {linkedInspection ? (
            <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardCheck className="h-4 w-4" strokeWidth={2.25} />
                Linked inspection
              </h2>
              <p className="mt-2 text-sm text-muted">
                This incident originated from a defect flagged during a pre-shift inspection.
              </p>
              <Link
                href={`/inspections/${linkedInspection.id}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-accent hover:underline"
              >
                View {linkedInspection.id} — {linkedInspection.equipmentName}
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
