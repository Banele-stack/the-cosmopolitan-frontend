import type { MiningRegion } from "@/lib/sites";

export type TradeType =
  | "Electrical"
  | "Rigging"
  | "Earthmoving"
  | "Scaffolding"
  | "Civil"
  | "Blasting Support"
  | "Catering"
  | "Security";

export const TRADE_TYPES: TradeType[] = [
  "Electrical",
  "Rigging",
  "Earthmoving",
  "Scaffolding",
  "Civil",
  "Blasting Support",
  "Catering",
  "Security",
];

export type DocumentType =
  | "COID Letter of Good Standing"
  | "Public Liability Insurance"
  | "Site Induction Certificate"
  | "Method Statement / Risk Assessment"
  | "B-BBEE Certificate";

export const DOCUMENT_TYPES: DocumentType[] = [
  "COID Letter of Good Standing",
  "Public Liability Insurance",
  "Site Induction Certificate",
  "Method Statement / Risk Assessment",
  "B-BBEE Certificate",
];

/** Derived compliance state for a single document or a whole contractor. */
export type ComplianceStatus = "Compliant" | "Expiring Soon" | "Non-Compliant";

export interface ComplianceDocument {
  id: string;
  contractorId: string;
  type: DocumentType;
  issueDate: string; // ISO date
  expiryDate: string; // ISO date
  referenceNumber: string;
  issuingBody: string;
  /** Null for documents that only ever had metadata (e.g. seeded demo data) — no file was ever attached. */
  fileUrl: string | null;
  fileOriginalName: string | null;
  fileMimeType: string | null;
  fileSizeBytes: number | null;
}

export type ActivityType =
  | "renewal"
  | "upload"
  | "induction"
  | "review"
  | "reminder"
  | "site-assignment"
  | "audit";

export interface ActivityLogEntry {
  id: string;
  contractorId: string;
  date: string; // ISO date
  type: ActivityType;
  description: string;
  actor: string;
}

export interface Contractor {
  id: string;
  companyName: string;
  tradeType: TradeType;
  /** Regions this contractor is contracted to work across (contracts are region-level, not tied to one named site). */
  regions: MiningRegion[];
  contactPerson: string;
  contactTitle: string;
  phone: string;
  email: string;
  bbeeLevel: number;
  contractValueZar: number;
  contractReference: string;
  onboardedDate: string; // ISO date
  documents: ComplianceDocument[];
  activity: ActivityLogEntry[];
}

/** A document flattened with its parent contractor for cross-contractor views. */
export interface DocumentWithContractor extends ComplianceDocument {
  contractorName: string;
  contractorTrade: TradeType;
  daysRemaining: number;
  status: ComplianceStatus;
}
