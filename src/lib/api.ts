/**
 * Fetch client for the CompliancePro NestJS + TypeORM backend
 * (compliance-pro-api, default http://localhost:3011). Every function here
 * used to be a synchronous read off a static mock-data array; they're now
 * async fetches against the real API, but return the exact same shapes
 * (see @/lib/types) so the rest of the app — status.ts, badges.ts, every
 * table/detail component — didn't need to change.
 *
 * `cache()` dedupes repeated calls within a single server render pass (e.g.
 * a layout and a page both asking for the contractor list); `cache: "no-store"`
 * on the underlying fetch keeps every request talking to the live database
 * instead of Next's default fetch cache, since this data changes at runtime
 * (new inspections, defect status, etc).
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  Contractor,
  Worker,
  Certification,
  Inspection,
  Incident,
  DocumentWithContractor,
  OrgMember,
} from "@/lib/types";
import type { MiningRegion } from "@/lib/sites";
import { getAllDocuments as deriveAllDocuments } from "@/lib/queries";
import type { BadgeTone } from "@/components/Badge";
import { getSessionToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Raw response body, when there was one — lets a caller that wants a
     * clean backend-provided message (e.g. a NestJS ValidationPipe/
     * exception filter's `{ message }`) parse it out instead of the
     * human-readable `message` above, which wraps it in request context. */
    public body?: string
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      `Could not reach the CompliancePro API at ${API_URL}. Is compliance-pro-api running?`
    );
  }
  if (res.status === 401) {
    // Session cookie is missing/expired/invalid — bounce to login rather
    // than surface a raw 401 in the middle of a page render.
    redirect("/login");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Pulls a clean backend-provided message out of an ApiError's raw response
 * body — e.g. a NestJS exception filter's `{ message: "..." }` — instead of
 * the human-readable `.message`, which wraps it in request/status context
 * not meant for a user-facing form. Falls back to `fallback` for anything
 * that isn't a parseable ApiError (network failure, non-JSON body, etc.).
 * Used by Route Handlers proxying a client form's mutation (invite/remove
 * team member, ...) so a validation error (409 duplicate email, ...) reads
 * the same way any other form validation message would.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  try {
    const message = JSON.parse(err.body || "{}").message;
    return Array.isArray(message) ? message.join(" ") : (message ?? fallback);
  } catch {
    return fallback;
  }
}

export function apiErrorStatus(err: unknown, fallback = 502): number {
  return err instanceof ApiError && err.status ? err.status : fallback;
}

async function apiFetchOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Contractors
// ---------------------------------------------------------------------------

export const getContractors = cache((): Promise<Contractor[]> => apiFetch("/contractors"));

export const getContractorById = cache(
  (id: string): Promise<Contractor | undefined> => apiFetchOrUndefined(`/contractors/${id}`)
);

// ---------------------------------------------------------------------------
// Workers & certifications
// ---------------------------------------------------------------------------

export const getWorkers = cache((): Promise<Worker[]> => apiFetch("/workers"));

export const getWorker = cache(
  (id: string): Promise<Worker | undefined> => apiFetchOrUndefined(`/workers/${id}`)
);

export const getCertifications = cache((): Promise<Certification[]> => apiFetch("/certifications"));

export const certsForWorker = cache(
  (workerId: string): Promise<Certification[]> => apiFetch(`/workers/${workerId}/certifications`)
);

// ---------------------------------------------------------------------------
// Inspections
// ---------------------------------------------------------------------------

export const getInspections = cache((): Promise<Inspection[]> => apiFetch("/inspections"));

export const getInspectionById = cache(
  (id: string): Promise<Inspection | undefined> => apiFetchOrUndefined(`/inspections/${id}`)
);

export interface CreateInspectionInput {
  equipmentName: string;
  equipmentType: string;
  equipmentId: string;
  siteId: string;
  inspectorName: string;
  shift: "Day" | "Night";
  date: string;
  notes?: string;
  checklist: { id: string; label: string; status: "Pass" | "Fail" | "N/A"; note?: string }[];
}

export function createInspection(input: CreateInspectionInput): Promise<Inspection> {
  return apiFetch("/inspections", { method: "POST", body: JSON.stringify(input) });
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export const getIncidents = cache((): Promise<Incident[]> => apiFetch("/incidents"));

export const getIncidentById = cache(
  (id: string): Promise<Incident | undefined> => apiFetchOrUndefined(`/incidents/${id}`)
);

export async function getIncidentByInspectionId(inspectionId: string): Promise<Incident | undefined> {
  const incidents = await getIncidents();
  return incidents.find((i) => i.linkedInspectionId === inspectionId);
}

// ---------------------------------------------------------------------------
// Cross-domain region lookups — the point of merging contractors, workforce
// and site safety: a contractor's detail page shows the mine's own workforce
// and recent safety activity at the same region(s).
// ---------------------------------------------------------------------------

export const getWorkersForRegion = cache(
  (region: MiningRegion): Promise<Worker[]> =>
    apiFetch(`/dashboard/region/${encodeURIComponent(region)}/workers`)
);

export const getContractorsForRegion = cache(
  (region: MiningRegion): Promise<Contractor[]> =>
    apiFetch(`/dashboard/region/${encodeURIComponent(region)}/contractors`)
);

export const getInspectionsForRegion = cache(
  (region: MiningRegion): Promise<Inspection[]> =>
    apiFetch(`/dashboard/region/${encodeURIComponent(region)}/inspections`)
);

export const getIncidentsForRegion = cache(
  (region: MiningRegion): Promise<Incident[]> =>
    apiFetch(`/dashboard/region/${encodeURIComponent(region)}/incidents`)
);

// ---------------------------------------------------------------------------
// Dashboard stats — aggregated across all four domains
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalContractors: number;
  contractorsNonCompliant: number;
  contractorsExpiringSoon: number;
  totalWorkers: number;
  workersNonCompliant: number;
  workersExpiringSoon: number;
  openDefects: number;
  inspectionsToday: number;
  inspectionComplianceRate: number;
  incidentsOpen: number;
  incidentsThisMonth: number;
}

export const getDashboardStats = cache((): Promise<DashboardStats> => apiFetch("/dashboard/stats"));

export interface NeedsAttentionItem {
  id: string;
  domain: "contractor" | "worker" | "inspection" | "incident";
  title: string;
  subtitle: string;
  href: string;
  tone: BadgeTone;
  urgencyRank: number;
}

export const getNeedsAttentionFeed = cache(
  (): Promise<NeedsAttentionItem[]> => apiFetch("/dashboard/needs-attention")
);

// ---------------------------------------------------------------------------
// Document queries — see @/lib/queries for the actual transform logic,
// which now takes the fetched contractor list as a parameter instead of
// importing a static array.
// ---------------------------------------------------------------------------

export async function getAllDocuments(): Promise<DocumentWithContractor[]> {
  const contractors = await getContractors();
  return deriveAllDocuments(contractors);
}

// ---------------------------------------------------------------------------
// Team — other users in the current session's organization. Admin-only to
// invite/remove; any member can view the list (see compliance-pro-api's
// OrganizationsController).
// ---------------------------------------------------------------------------

export const getMembers = cache((): Promise<OrgMember[]> => apiFetch("/organizations/members"));

export interface InviteMemberInput {
  name: string;
  email: string;
  role?: "admin" | "member";
}

export function inviteMember(input: InviteMemberInput): Promise<OrgMember> {
  return apiFetch("/organizations/members", { method: "POST", body: JSON.stringify(input) });
}

export function removeMember(id: string): Promise<{ message: string }> {
  return apiFetch(`/organizations/members/${id}`, { method: "DELETE" });
}
