export type Role =
  | "Rock Drill Operator"
  | "Winch Driver"
  | "Blaster"
  | "Team Leader"
  | "Artisan"
  | "General Miner";

export const ROLES: Role[] = [
  "Rock Drill Operator",
  "Winch Driver",
  "Blaster",
  "Team Leader",
  "Artisan",
  "General Miner",
];

export type CertificationType =
  | "Blasting Certificate"
  | "First Aid Level 2"
  | "Medical Fitness Certificate"
  | "Confined Space Entry"
  | "Working at Heights"
  | "Fire Fighting";

export const CERTIFICATION_TYPES: CertificationType[] = [
  "Blasting Certificate",
  "First Aid Level 2",
  "Medical Fitness Certificate",
  "Confined Space Entry",
  "Working at Heights",
  "Fire Fighting",
];

/** Overall lifecycle status of a single certification instance. */
export type CertStatus = "Valid" | "Expiring Soon" | "Expired" | "Red-Flagged";

export interface Certification {
  id: string;
  workerId: string;
  type: CertificationType;
  issuingBody: string;
  issueDate: string; // ISO date
  expiryDate: string; // ISO date
  status: CertStatus;
}

export interface Worker {
  id: string;
  employeeNumber: string;
  name: string;
  role: Role;
  /** The specific named site this worker is stationed at. */
  siteId: string;
  startDate: string; // ISO date
}

/** Aggregate status for a worker computed from their certifications. */
export type WorkerOverallStatus = "Fully Certified" | "Expiring Soon" | "Non-Compliant";
