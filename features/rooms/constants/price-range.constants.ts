// Extracted from SearchBar's inline <option> list so the same value/label
// pairs can also drive the "Featured Rooms" heading (see
// formatRoomsHeading) without the two drifting out of sync.
export const ROOM_PRICE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "0-2000", label: "R0 - R2,000" },
  { value: "2000-4000", label: "R2,000 - R4,000" },
  { value: "4000-6000", label: "R4,000 - R6,000" },
  { value: "6000-10000", label: "R6,000 - R10,000" },
  { value: "10000+", label: "R10,000+" },
];
