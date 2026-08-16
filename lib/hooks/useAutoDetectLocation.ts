"use client";

import { useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/geocode";

// Reverse-geocodes the visitor's GPS position once on mount into a
// human-readable area name (e.g. "Cosmo City") for DISPLAY only — e.g. the
// "Rooms within 15km of Cosmo City" label falls back to this when no
// location has been manually searched.
//
// This used to also silently push the coordinates into the room/business/
// gig search stores, which — since those stores' lat/lng feed straight
// into each listing fetch's dependency array — caused a second, invisible
// fetch to fire moments after the first: the page loads with one set of
// listings, then silently swaps to a "near you" set once geolocation
// resolves. That's exactly the flash/reflow this was rewritten to avoid.
// Geolocation no longer drives what's fetched at all; it only ever labels
// what's already showing.
export function useAutoDetectLocation(): string | null {
  const [detectedArea, setDetectedArea] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      const result = await reverseGeocode(lat, lng);

      if (result?.area) {
        setDetectedArea(result.area);
      }
    });
  }, []);

  return detectedArea;
}
