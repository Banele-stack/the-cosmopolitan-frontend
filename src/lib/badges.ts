import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
  Info,
  AlertOctagon,
  CircleDot,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { BadgeTone } from "@/components/Badge";
import type {
  ComplianceStatus,
  CertStatus,
  WorkerOverallStatus,
  InspectionResult,
  ChecklistItemStatus,
  DefectStatus,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/types";

export interface BadgeSpec {
  tone: BadgeTone;
  label: string;
  icon: LucideIcon;
}

// Contractors / documents ---------------------------------------------------

export function documentStatusBadge(status: ComplianceStatus): BadgeSpec {
  switch (status) {
    case "Compliant":
      return { tone: "good", label: "Compliant", icon: CheckCircle2 };
    case "Expiring Soon":
      return { tone: "warning", label: "Expiring Soon", icon: AlertTriangle };
    case "Non-Compliant":
      return { tone: "critical", label: "Non-Compliant", icon: XCircle };
  }
}

// Workers / certifications ---------------------------------------------------

export function certStatusBadge(status: CertStatus): BadgeSpec {
  switch (status) {
    case "Valid":
      return { tone: "good", label: "Valid", icon: CheckCircle2 };
    case "Expiring Soon":
      return { tone: "warning", label: "Expiring Soon", icon: Clock };
    case "Expired":
      return { tone: "critical", label: "Expired", icon: AlertTriangle };
    case "Red-Flagged":
      return { tone: "critical", label: "Red-Flagged", icon: ShieldAlert };
  }
}

export function workerStatusBadge(status: WorkerOverallStatus): BadgeSpec {
  switch (status) {
    case "Fully Certified":
      return { tone: "good", label: "Fully Certified", icon: CheckCircle2 };
    case "Expiring Soon":
      return { tone: "warning", label: "Expiring Soon", icon: Clock };
    case "Non-Compliant":
      return { tone: "critical", label: "Non-Compliant", icon: ShieldAlert };
  }
}

// Inspections -----------------------------------------------------------

export function inspectionResultBadge(result: InspectionResult): BadgeSpec {
  switch (result) {
    case "Pass":
      return { tone: "good", label: "Pass", icon: CheckCircle2 };
    case "Defect Found":
      return { tone: "critical", label: "Defect Found", icon: XCircle };
    case "Pending":
      return { tone: "neutral", label: "Pending", icon: Clock };
  }
}

export function checklistStatusBadge(status: ChecklistItemStatus): BadgeSpec {
  switch (status) {
    case "Pass":
      return { tone: "good", label: "Pass", icon: CheckCircle2 };
    case "Fail":
      return { tone: "critical", label: "Fail", icon: XCircle };
    case "N/A":
      return { tone: "neutral", label: "N/A", icon: CircleDot };
  }
}

export function defectStatusBadge(status: DefectStatus): BadgeSpec {
  switch (status) {
    case "Open":
      return { tone: "critical", label: "Open", icon: CircleDot };
    case "In Progress":
      return { tone: "warning", label: "In Progress", icon: Loader2 };
    case "Resolved":
      return { tone: "good", label: "Resolved", icon: CheckCircle2 };
  }
}

// Incidents ---------------------------------------------------------------

export function incidentSeverityBadge(severity: IncidentSeverity): BadgeSpec {
  switch (severity) {
    case "Near Miss":
      return { tone: "info", label: "Near Miss", icon: Info };
    case "Minor":
      return { tone: "warning", label: "Minor", icon: AlertTriangle };
    case "Serious":
      return { tone: "critical", label: "Serious", icon: AlertTriangle };
    case "Reportable":
      return { tone: "critical", label: "Reportable", icon: AlertOctagon };
  }
}

export function incidentStatusBadge(status: IncidentStatus): BadgeSpec {
  switch (status) {
    case "Open":
      return { tone: "critical", label: "Open", icon: CircleDot };
    case "Under Investigation":
      return { tone: "info", label: "Under Investigation", icon: Clock };
    case "Closed":
      return { tone: "good", label: "Closed", icon: CheckCircle2 };
  }
}
