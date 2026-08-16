// Turns the active category filter into the page's H1/H2 so the heading
// itself reflects what's being browsed (e.g. "Beauty Businesses",
// "DJs in Events") instead of staying a static label while only the
// subtitle below it (see formatNearbyLabel) changes. Shared by the
// Businesses and Piece Jobs views, which both filter by the same
// category/subcategory pair — see business-category.seed.ts.
export function formatCategoryHeading(
  defaultLabel: string,
  noun: string,
  categoryName: string,
  subcategoryName: string
): string {
  if (subcategoryName) {
    return `${subcategoryName} in ${categoryName}`;
  }

  if (categoryName) {
    return `${categoryName} ${noun}`;
  }

  return defaultLabel;
}

// Rooms don't have categories — the closest equivalent filters are the
// quick-filter tags (WiFi Included, Furnished, ...) and price range, so
// those are what the "Featured Rooms" heading reflects instead.
export function formatRoomsHeading(
  activeTags: string[],
  priceRange: string,
  priceRangeOptions: { value: string; label: string }[]
): string {
  if (activeTags.length > 0) {
    return `${activeTags.join(" & ")} Rooms`;
  }

  const priceLabel = priceRangeOptions.find(
    (option) => option.value === priceRange
  )?.label;

  if (priceLabel) {
    return `${priceLabel} Rooms`;
  }

  return "Featured Rooms";
}
