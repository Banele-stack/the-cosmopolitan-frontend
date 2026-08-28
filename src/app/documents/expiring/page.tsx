import ExpiringDocumentsPageClient from "@/components/documents/ExpiringDocumentsPageClient";
import { getAllDocuments } from "@/lib/api";

export default async function ExpiringDocumentsPage() {
  const allDocuments = await getAllDocuments();
  return <ExpiringDocumentsPageClient allDocuments={allDocuments} />;
}
