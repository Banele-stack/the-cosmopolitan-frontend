export type ShiftType = "Day" | "Night";

export type InspectionResult = "Pass" | "Defect Found" | "Pending";

export type EquipmentType =
  | "Haul Truck"
  | "LHD Loader"
  | "Conveyor Belt"
  | "Ventilation Fan"
  | "Shaft Station"
  | "Drill Rig"
  | "Light Vehicle"
  | "Water Pump Station";

export type ChecklistItemStatus = "Pass" | "Fail" | "N/A";

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  note?: string;
}

export type DefectStatus = "Open" | "In Progress" | "Resolved";

export interface Defect {
  id: string;
  checklistItemLabel: string;
  description: string;
  status: DefectStatus;
  raisedBy: string;
  raisedDate: string;
  linkedIncidentId?: string;
}

export interface Inspection {
  id: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  equipmentId: string;
  /** The specific named site this equipment is located at. */
  siteId: string;
  inspectorName: string;
  shift: ShiftType;
  date: string; // ISO date
  result: InspectionResult;
  checklist: ChecklistItem[];
  notes: string;
  defects: Defect[];
}
