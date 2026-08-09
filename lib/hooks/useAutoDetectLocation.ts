"use client";

import { useEffect, useState } from "react";
import { useBusinessSearchStore } from "@/features/business/store/business-search.store";
import { useRoomSearchStore } from "@/features/rooms/store/room-search.store";
import { useGigSearchStore } from "@/features/gigs/store/gig-search.store";
import { reverseGeocode } from "@/lib/geocode";

// Detects the visitor's GPS position once on mount and applies it to the
// room, business, and gig search stores — they're independent zustand
// stores, so each needs the coordinates set individually. The coordinates
// are also reverse-geocoded into a human-readable area name (e.g. "Cosmo
// City") which is returned for display purposes only.
//
// This intentionally does NOT write the detected area into either store's
// `location` field: `location` being non-empty switches the backend from
// "nearby, radius-based" to "exact area match" (see business/room service
// findAll()). Auto-detection should stay on the radius path so the
// escalation behavior (15km -> 50km -> no cap) still applies; only an
// explicit manual search should switch to exact matching.
export function useAutoDetectLocation(): string | null {
  const [detectedArea, setDetectedArea] = useState<string | null>(null);

  const setBusinessCoordinates = useBusinessSearchStore(
    (state) => state.setCoordinates
  );
  const setRoomCoordinates = useRoomSearchStore(
    (state) => state.setCoordinates
  );
  const setGigCoordinates = useGigSearchStore(
    (state) => state.setCoordinates
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;

      setBusinessCoordinates(lat, lng);
      setRoomCoordinates(lat, lng);
      setGigCoordinates(lat, lng);

      const result = await reverseGeocode(lat, lng);

      if (result?.area) {
        setDetectedArea(result.area);
      }
    });
    // Runs once on mount — the store setters are stable zustand actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return detectedArea;
}
