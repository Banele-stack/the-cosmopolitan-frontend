const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ReverseGeocodeResult {
  label: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
}

// Turns a GPS pair into a human-readable area (e.g. "Cosmo City") via the
// backend's /geocode/reverse route, which proxies Nominatim. Returns null
// on any failure — callers should treat that as "couldn't name it" and
// fall back to a generic label, not as an error to surface.
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `${API_URL}/geocode/reverse?lat=${lat}&lng=${lng}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}
