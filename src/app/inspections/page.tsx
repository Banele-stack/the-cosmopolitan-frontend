import InspectionsPageClient from "@/components/inspections/InspectionsPageClient";
import { getInspections } from "@/lib/api";

export default async function InspectionsPage() {
  const inspections = await getInspections();
  return <InspectionsPageClient inspections={inspections} />;
}
