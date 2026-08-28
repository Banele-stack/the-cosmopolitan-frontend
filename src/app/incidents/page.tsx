import IncidentsPageClient from "@/components/incidents/IncidentsPageClient";
import { getIncidents } from "@/lib/api";

export default async function IncidentsPage() {
  const incidents = await getIncidents();
  return <IncidentsPageClient incidents={incidents} />;
}
