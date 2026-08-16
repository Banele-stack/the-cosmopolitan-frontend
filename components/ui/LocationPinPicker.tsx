"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// South Africa's rough centre — used only until a real address/pin is set.
const DEFAULT_CENTER: [number, number] = [-28.4793, 24.6727];
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 16;

interface LocationPinPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationPinPicker({
  lat,
  lng,
  onChange,
  className = "",
}: LocationPinPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mount the map once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const initialCenter: [number, number] =
        lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: lat != null && lng != null ? PIN_ZOOM : DEFAULT_ZOOM,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(initialCenter, {
        icon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter/move the pin when lat/lng change from outside (e.g. the
  // address autocomplete resolving a new place) — but leave it alone
  // while the user is actively dragging it themselves.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (lat == null || lng == null) return;

    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], PIN_ZOOM);
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`h-64 w-full overflow-hidden rounded-xl border border-gray-200 ${className}`}
    />
  );
}
