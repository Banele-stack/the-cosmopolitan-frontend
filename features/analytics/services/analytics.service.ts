const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ListingType = "room" | "business" | "gig";

// Matches each listing type to its API route prefix — "gig" maps to the
// plural "gigs" controller, the others match their type name directly.
const PATH: Record<ListingType, string> = {
  room: "room",
  business: "business",
  gig: "gigs",
};

// Simple engagement counters (LinkedIn-style "N people viewed this"), shown
// only to the listing's own owner — see the "Your listing stats" block on
// each detail page. Both calls are fire-and-forget: a failed view/click
// ping should never interrupt someone browsing or contacting a listing.

// Deduped once per tab session per listing, so refreshing or navigating
// back and forth doesn't inflate the count — sessionStorage (not
// localStorage) so a new visit in a new tab still counts.
export function recordView(type: ListingType, id: number) {
  const key = `northstar_viewed_${type}_${id}`;

  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  fetch(`${API_URL}/${PATH[type]}/${id}/view`, { method: "PATCH" }).catch(
    () => {},
  );
}

// Not deduped — every genuine contact click (WhatsApp, phone, etc.) is a
// real signal worth counting.
export function recordContactClick(type: ListingType, id: number) {
  fetch(`${API_URL}/${PATH[type]}/${id}/contact-click`, {
    method: "PATCH",
  }).catch(() => {});
}
