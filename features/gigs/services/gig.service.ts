import { Paginated } from "@/types/pagination";
import { CreateGigDto, Gig, GigFilters } from "@/features/gigs/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// CreateGigDto/GigFilters now live in ./types alongside the rest of this
// feature's domain types — re-exported here so existing
// `import { CreateGigDto } from ".../gig.service"` call sites keep working.
export type { CreateGigDto, GigFilters };

export async function getGigs(filters?: GigFilters): Promise<Paginated<Gig>> {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.categorySlug) params.append("categorySlug", filters.categorySlug);
  if (filters?.subcategorySlug) params.append("subcategorySlug", filters.subcategorySlug);
  if (filters?.urgency) params.append("urgency", filters.urgency);
  if (filters?.location) params.append("location", filters.location);
  if (filters?.lat != null) params.append("lat", filters.lat.toString());
  if (filters?.lng != null) params.append("lng", filters.lng.toString());
  if (filters?.page != null) params.append("page", filters.page.toString());
  if (filters?.limit != null) params.append("limit", filters.limit.toString());

  const response = await fetch(`${API_URL}/gigs?${params.toString()}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch gigs");
  }

  return result;
}

export async function getGig(id: number): Promise<Gig> {
  const response = await fetch(`${API_URL}/gigs/${id}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch gig");
  }

  return result;
}

export async function createGig(data: CreateGigDto) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/gigs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to post gig.");
  }

  return result;
}

export async function updateGig(id: number, data: Partial<CreateGigDto>) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/gigs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update gig.");
  }

  return result;
}

export async function deleteGig(id: number) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/gigs/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Failed to delete gig.");
  }
}

export async function updateGigStatus(id: number, status: "active" | "filled") {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/gigs/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update gig.");
  }

  return result;
}
