import { NearbyMeta } from "@/types/pagination";

// Builds the "Rooms/Services around ..." subheading text shared by the
// rooms and businesses views. `noun` is what's being listed (e.g. "Rooms",
// "Businesses"); `placeLabel` is the manually-picked location, the
// auto-detected area, or "you" as a last resort.
//
// `resultCount` matters because resolveNearbyRadius() (backend) always
// escalates to its last, uncapped level and reports `expanded: true` once
// it gets there — even when that final, no-distance-cap query *still*
// comes back with zero rows (e.g. every business is "online" and thus
// excluded from location search, or a category/rating filter excludes
// everything). Without checking the count here, that case rendered as
// "Nothing nearby — showing the closest services regardless of distance"
// right above an empty grid, which reads as a bug (says it found
// something, shows nothing) rather than the honest "there's genuinely
// nothing to show yet" it actually is.
export function formatNearbyLabel(
  noun: string,
  placeLabel: string,
  nearby: NearbyMeta | null,
  resultCount?: number
): string {
  if (resultCount === 0) {
    return `No ${noun.toLowerCase()} found — check back soon`;
  }

  if (!nearby) {
    return `${noun} around ${placeLabel}`;
  }

  if (!nearby.expanded) {
    return `${noun} within ${nearby.radiusKm}km of ${placeLabel}`;
  }

  return nearby.radiusKm != null
    ? `Nothing within the usual radius — showing the closest ${noun.toLowerCase()}, up to ${nearby.radiusKm}km away`
    : `Nothing nearby — showing the closest ${noun.toLowerCase()} regardless of distance`;
}
