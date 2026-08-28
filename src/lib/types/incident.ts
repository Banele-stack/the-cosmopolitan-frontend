export type IncidentSeverity = "Near Miss" | "Minor" | "Serious" | "Reportable";

export type IncidentStatus = "Open" | "Under Investigation" | "Closed";

export interface CorrectiveAction {
  id: string;
  description: string;
  owner: string;
  dueDate: string; // ISO date
  done: boolean;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  date: string; // ISO date
  /** The specific named site this incident occurred at. */
  siteId: string;
  location: string;
  description: string;
  personsInvolved: string[];
  immediateActions: string;
  rootCause?: string;
  correctiveActions: CorrectiveAction[];
  linkedInspectionId?: string;
}
