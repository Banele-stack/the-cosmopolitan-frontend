import { PriceRange } from "@/features/business/types";

// The stored value is still the "$".."$$$$" symbol (that's what the backend
// filters/matches on — see BusinessService.findNearDuplicate/findAll), but
// the label shown to users is a plain Rand band — no "$" signs, since this
// is a Rand-priced marketplace, not a dollar one.
export const PRICE_RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "$", label: "Under R100" },
  { value: "$$", label: "R100 – R300" },
  { value: "$$$", label: "R300 – R700" },
  { value: "$$$$", label: "R700+" },
];
