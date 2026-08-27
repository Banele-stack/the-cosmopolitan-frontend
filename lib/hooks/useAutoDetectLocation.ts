"use client";

import { useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/geocode";

export interface DetectedLocation {
  // Human-readable area name (e.g. "Cosmo City") — null if geolocation
  // hasn't resolved yet, or resolved but reverse geocoding couldn't name it.
  area: string | null;
  lat: number | null;
  lng: number | null;
  // "pending": still waiting on the browser's geolocation prompt/result —
  // callers with a "Near Me" default should hold off fetching rather than
  // fire an unfiltered query and swap it moments later (see below).
  // "resolved": lat/lng (and, best-effort, area) are usable.
  // "unavailable": no geolocation support, permission denied, or timed out
  // — callers should fall back to an unfiltered/default query now, since
  // no position is coming.
  status: "pending" | "resolved" | "unavailable";
}

const GEOLOCATION_TIMEOUT_MS = 8000;

// Resolves the visitor's GPS position once on mount into both a
// human-readable area name and the raw coordinates.
//
// This used to only expose the area name, for DISPLAY only (e.g. the
// "Rooms within 15km of Cosmo City" label), while coordinates were never
// used to actually drive what got fetched — an earlier version pushed them
// into the room/business/gig search stores as a side effect, which caused
// a second, invisible fetch: the page loaded with one (unfiltered) set of
// listings, then silently swapped to a "near you" set once geolocation
// resolved moments later. That flash/reflow was real, but the fix that
// shipped for it overcorrected: it decoupled geolocation from fetching
// entirely, so "Near Me" stopped meaning anything — the label would say
// "Businesses around Cosmo City" while the actual query, having no location
// filter at all, returned every business regardless of where it was.
//
// The right fix is to gate the *first* fetch on `status` instead of firing
// it immediately: callers wait for "resolved"/"unavailable" (not "pending")
// before running their default "Near Me" query, then use lat/lng from here
// as that query's coordinates. One fetch, using real position data, no
// flash — see app/page.tsx and FeaturedListings.tsx.
export function useAutoDetectLocation(): DetectedLocation {
  const [state, setState] = useState<DetectedLocation>({
    area: null,
    lat: null,
    lng: null,
    status: "pending",
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: "unavailable" }));
      return;
    }

    let settled = false;
    const finish = (next: Partial<DetectedLocation> & { status: DetectedLocation["status"] }) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      setState((s) => ({ ...s, ...next }));
    };

    // Belt-and-braces: some browsers/environments never call either
    // getCurrentPosition callback if a permission prompt is left dangling
    // (rather than explicitly denied), which would leave status stuck on
    // "pending" forever and every "Near Me" view stuck loading.
    const safetyTimer = setTimeout(
      () => finish({ status: "unavailable" }),
      GEOLOCATION_TIMEOUT_MS + 1000,
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const result = await reverseGeocode(lat, lng);
        finish({ area: result?.area ?? null, lat, lng, status: "resolved" });
      },
      () => finish({ status: "unavailable" }),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 5 * 60 * 1000 },
    );

    return () => clearTimeout(safetyTimer);
  }, []);

  return state;
}
