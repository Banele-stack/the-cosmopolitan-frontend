import { daysUntil } from "@/lib/utils";
import type {
  ComplianceDocument,
  ComplianceStatus,
  Contractor,
  CertificationType,
  CertStatus,
  Certification,
  WorkerOverallStatus,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Contractors / documents
// ---------------------------------------------------------------------------

export const DOCUMENT_EXPIRING_SOON_DAYS = 30;

export function getStatusForDays(daysRemaining: number): ComplianceStatus {
  if (daysRemaining < 0) return "Non-Compliant";
  if (daysRemaining <= DOCUMENT_EXPIRING_SOON_DAYS) return "Expiring Soon";
  return "Compliant";
}

export function getDocumentStatus(doc: ComplianceDocument): ComplianceStatus {
  return getStatusForDays(daysUntil(doc.expiryDate));
}

/** A contractor's overall status is the worst status among its documents. */
export function getContractorStatus(contractor: Contractor): ComplianceStatus {
  const statuses = contractor.documents.map(getDocumentStatus);
  if (statuses.includes("Non-Compliant")) return "Non-Compliant";
  if (statuses.includes("Expiring Soon")) return "Expiring Soon";
  return "Compliant";
}

/** The soonest expiry date across a contractor's documents (may be in the past). */
export function getSoonestExpiry(contractor: Contractor): ComplianceDocument {
  return [...contractor.documents].sort(
    (a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)
  )[0];
}

// ---------------------------------------------------------------------------
// Workers / certifications
// ---------------------------------------------------------------------------

/** A cert enters the amber "Expiring Soon" band this many days before expiry. */
export const CERT_EXPIRING_SOON_DAYS = 45;

/**
 * Derives a certification's lifecycle status from its expiry date.
 * Medical Fitness Certificates ("red tickets") that lapse are Red-Flagged
 * rather than merely Expired, since a lapsed medical bars underground work.
 */
export function computeCertStatus(type: CertificationType, expiryDate: string): CertStatus {
  const remaining = daysUntil(expiryDate);
  if (remaining < 0) {
    return type === "Medical Fitness Certificate" ? "Red-Flagged" : "Expired";
  }
  if (remaining <= CERT_EXPIRING_SOON_DAYS) {
    return "Expiring Soon";
  }
  return "Valid";
}

/** Rolls a worker's individual certification statuses up into one overall status. */
export function computeWorkerOverallStatus(certs: Certification[]): WorkerOverallStatus {
  if (certs.some((c) => c.status === "Expired" || c.status === "Red-Flagged")) {
    return "Non-Compliant";
  }
  if (certs.some((c) => c.status === "Expiring Soon")) {
    return "Expiring Soon";
  }
  return "Fully Certified";
}
