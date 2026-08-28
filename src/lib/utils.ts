/**
 * Cross-domain date/format helpers shared by contractors, workforce and
 * safety data.
 *
 * Anchored to the real clock, evaluated fresh on every call — mirrors
 * compliance-pro-api's src/common/status.util.ts exactly so the API's
 * numbers agree with the UI's own client-side badge logic. (An earlier
 * version hardcoded a fixed demo date here; that broke the moment real
 * customer certificates were judged against it instead of the actual date.)
 */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function today(): Date {
  return new Date(`${todayIso()}T00:00:00Z`);
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from today to the given ISO date. Negative means in the past. */
export function daysUntil(isoDate: string): number {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return Math.round((d.getTime() - today().getTime()) / MS_PER_DAY);
}

export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining);
    return `Expired ${overdue} day${overdue === 1 ? "" : "s"} ago`;
  }
  if (daysRemaining === 0) return "Expires today";
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
}

export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatZar(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
