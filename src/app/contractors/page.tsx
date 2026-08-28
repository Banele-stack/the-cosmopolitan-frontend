import ContractorsPageClient from "@/components/contractors/ContractorsPageClient";
import { getContractors } from "@/lib/api";
import { TRADE_TYPES } from "@/lib/types";

export default async function ContractorsPage() {
  const contractors = await getContractors();
  return <ContractorsPageClient contractors={contractors} tradeTypes={TRADE_TYPES} />;
}
