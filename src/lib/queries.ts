import type { Contractor, DocumentWithContractor } from "@/lib/types";
import { getDocumentStatus, getSoonestExpiry } from "@/lib/status";
import { daysUntil } from "@/lib/utils";

/** Every document across every contractor, flattened with contractor context. */
export function getAllDocuments(contractors: Contractor[]): DocumentWithContractor[] {
  return contractors.flatMap((contractor) =>
    contractor.documents.map((doc) => ({
      ...doc,
      contractorName: contractor.companyName,
      contractorTrade: contractor.tradeType,
      daysRemaining: daysUntil(doc.expiryDate),
      status: getDocumentStatus(doc),
    }))
  );
}

/** Contractors sorted by their soonest-expiring (or most-overdue) document. */
export function getContractorsSortedByExpiry(contractors: Contractor[]): Contractor[] {
  return [...contractors].sort((a, b) => {
    const aDays = daysUntil(getSoonestExpiry(a).expiryDate);
    const bDays = daysUntil(getSoonestExpiry(b).expiryDate);
    return aDays - bDays;
  });
}

/** Documents expiring within `withinDays`, including already-overdue ones, soonest first. */
export function getExpiringDocuments(contractors: Contractor[], withinDays: number): DocumentWithContractor[] {
  return getAllDocuments(contractors)
    .filter((d) => d.daysRemaining <= withinDays)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}
