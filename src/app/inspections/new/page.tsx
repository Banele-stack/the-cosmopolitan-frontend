"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Check, X, Minus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { MINING_SITES } from "@/lib/sites";
import { todayIso } from "@/lib/utils";
import type { CreateInspectionInput } from "@/lib/api";
import type { ChecklistItemStatus, EquipmentType, ShiftType } from "@/lib/types";

/**
 * Posts to the Route Handler at app/api/inspections/route.ts rather than
 * calling compliance-pro-api directly — this is a client component, and
 * @/lib/api is server-only (it reads the session cookie via next/headers),
 * so it can only be called from a server context like that route handler.
 */
async function submitInspection(input: CreateInspectionInput) {
  const res = await fetch("/api/inspections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message ?? "Failed to submit inspection.");
  }
  return body;
}

const CHECKLIST_TEMPLATE: { id: string; label: string; description: string }[] = [
  { id: "brakes", label: "Service & park brakes", description: "Pedal travel, response and park brake hold tested." },
  { id: "lights", label: "Lights & indicators", description: "Headlights, taillights, beacon and indicators functional." },
  { id: "fire-extinguisher", label: "Fire extinguisher", description: "Present, charged, pin sealed and within service date." },
  { id: "seatbelt", label: "Seatbelt", description: "Buckle latches securely and webbing shows no fraying." },
  { id: "tyres", label: "Tyres & wheel nuts", description: "Pressure, tread depth and wheel nut torque markers checked." },
  { id: "ground-support", label: "Ground support", description: "Mesh, bolts and shotcrete in the working area inspected for damage." },
  { id: "ventilation", label: "Ventilation", description: "Airflow present and within acceptable limits for the section." },
  { id: "emergency-exits", label: "Emergency exits", description: "Escapeways clear, signed and unobstructed." },
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  "Haul Truck",
  "LHD Loader",
  "Conveyor Belt",
  "Ventilation Fan",
  "Shaft Station",
  "Drill Rig",
  "Light Vehicle",
  "Water Pump Station",
];

type ChecklistState = Record<string, ChecklistItemStatus>;

const STATUS_OPTIONS: { value: ChecklistItemStatus; label: string; icon: typeof Check }[] = [
  { value: "Pass", label: "Pass", icon: Check },
  { value: "Fail", label: "Fail", icon: X },
  { value: "N/A", label: "N/A", icon: Minus },
];

function statusButtonClasses(active: boolean, value: ChecklistItemStatus) {
  if (!active) {
    return "border-border bg-surface text-muted hover:bg-surface-muted";
  }
  if (value === "Pass") {
    return "border-[var(--status-good-border)] bg-[var(--status-good-bg)] text-[var(--status-good-text)]";
  }
  if (value === "Fail") {
    return "border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical-text)]";
  }
  return "border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]";
}

export default function NewInspectionPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentType, setEquipmentType] = useState<EquipmentType>("Haul Truck");
  const [equipmentId, setEquipmentId] = useState("");
  const [siteId, setSiteId] = useState(MINING_SITES[0]?.id ?? "");
  const [inspectorName, setInspectorName] = useState("");
  const [shift, setShift] = useState<ShiftType>("Day");
  const [date, setDate] = useState(todayIso);
  const [notes, setNotes] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistState>(() =>
    Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c.id, "Pass" as ChecklistItemStatus]))
  );

  const failCount = Object.values(checklist).filter((v) => v === "Fail").length;

  function setItemStatus(id: string, status: ChecklistItemStatus) {
    setChecklist((prev) => ({ ...prev, [id]: status }));
  }

  function handlePhotoClick() {
    setPhotoAttached(true);
    showToast("Photo capture is disabled in this demo build.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitInspection({
        equipmentName,
        equipmentType,
        equipmentId,
        siteId,
        inspectorName,
        shift,
        date,
        notes,
        checklist: CHECKLIST_TEMPLATE.map((c) => ({
          id: c.id,
          label: c.label,
          status: checklist[c.id],
        })),
      });
      showToast("Inspection submitted successfully. Redirecting to inspections...");
      window.setTimeout(() => {
        router.push("/inspections");
      }, 1100);
    } catch (err) {
      setSubmitting(false);
      showToast(err instanceof Error ? err.message : "Failed to submit inspection.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/inspections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Back to inspections
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">New Pre-Shift Inspection</h1>
        <p className="mt-1 text-sm text-muted">
          Complete the checklist before operating any equipment or entering the working section. Items marked
          Fail must be reported to your shift supervisor immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Inspection details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="equipmentName" className="text-xs font-medium text-muted">
                Equipment / area name
              </label>
              <input
                id="equipmentName"
                required
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                placeholder="e.g. CAT 777D Haul Truck"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="equipmentType" className="text-xs font-medium text-muted">
                Equipment type
              </label>
              <select
                id="equipmentType"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {EQUIPMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="equipmentId" className="text-xs font-medium text-muted">
                Asset / fleet number
              </label>
              <input
                id="equipmentId"
                required
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g. HT-14"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="site" className="text-xs font-medium text-muted">
                Site
              </label>
              <select
                id="site"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {MINING_SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.region}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inspectorName" className="text-xs font-medium text-muted">
                Inspector name
              </label>
              <input
                id="inspectorName"
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="e.g. Thabo Nkosi"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-xs font-medium text-muted">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-muted">Shift</span>
              <div className="flex gap-2">
                {(["Day", "Night"] as ShiftType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShift(s)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      shift === s
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-muted hover:bg-surface-muted"
                    }`}
                  >
                    {s} shift
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Checklist items</h2>
            {failCount > 0 ? (
              <span className="rounded-full border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] px-2.5 py-1 text-xs font-semibold" style={{ color: "var(--status-critical-text)" }}>
                {failCount} item{failCount > 1 ? "s" : ""} flagged
              </span>
            ) : null}
          </div>

          <ul className="mt-4 divide-y divide-border">
            {CHECKLIST_TEMPLATE.map((checkItem) => (
              <li
                key={checkItem.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{checkItem.label}</p>
                  <p className="text-xs text-muted">{checkItem.description}</p>
                </div>
                <div role="radiogroup" aria-label={checkItem.label} className="flex shrink-0 gap-1.5">
                  {STATUS_OPTIONS.map((option) => {
                    const active = checklist[checkItem.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setItemStatus(checkItem.id, option.value)}
                        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${statusButtonClasses(
                          active,
                          option.value
                        )}`}
                      >
                        <option.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Photo evidence</h2>
          <p className="mt-1 text-xs text-muted">Attach a photo of any flagged item for the maintenance record.</p>
          <button
            type="button"
            onClick={handlePhotoClick}
            className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface-muted px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-border">
              <Camera className="h-5 w-5" strokeWidth={2} />
            </span>
            {photoAttached ? (
              <span className="text-sm font-medium text-accent">
                preshift-photo-{date || todayIso()}.jpg attached
              </span>
            ) : (
              <span className="text-sm font-medium text-foreground">Tap to attach a photo</span>
            )}
            <span className="text-xs text-muted">JPG or PNG, up to 10MB &middot; demo only, no file is uploaded</span>
          </button>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <label htmlFor="notes" className="text-sm font-semibold text-foreground">
            Notes
          </label>
          <p className="mt-1 text-xs text-muted">
            Record any additional observations, near misses or context for this inspection.
          </p>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Machine parked and tagged out pending workshop attention."
            className="mt-3 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/inspections"
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm hover:bg-surface-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Submitting...
              </>
            ) : (
              "Submit Inspection"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
