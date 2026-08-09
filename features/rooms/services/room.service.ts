import { Paginated } from "@/types/pagination";
import { Room } from "@/features/rooms/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateRoomDto {
  name: string;
  category: string;
  propertyType: string;

  price: number;

  description: string;

  phoneNumber: string;
  whatsappNumber?: string;

  bedrooms: number;
  bathrooms: number;
  size?: number;

  availableFrom: string;

  deposit: number;

  leaseTerm: string;

  location: {
    address: string;
    area: string;
    lat: number;
    lng: number;
  };

  amenities?: {
    furnished: boolean;
    parking: boolean;
    wifi: boolean;
    electricityIncluded: boolean;
    waterIncluded: boolean;
    petsAllowed: boolean;
  };

  images?: string[];
  videos?: string[];
}

export interface RoomFilters {
  location?: string;
  filter?: string;
  activeTags?: string[];
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

export const getRooms = async (
  filters?: RoomFilters
): Promise<Paginated<Room>> => {
  const params = new URLSearchParams();

  if (filters?.location) {
    params.append("location", filters.location);
  }

  if (filters?.filter) {
    params.append("filter", filters.filter);
  }

  if (filters?.lat != null) {
    params.append("lat", filters.lat.toString());
  }

  if (filters?.lng != null) {
    params.append("lng", filters.lng.toString());
  }

  filters?.activeTags?.forEach((tag) => {
    params.append("tags", tag);
  });

  if (filters?.page != null) {
    params.append("page", filters.page.toString());
  }

  if (filters?.limit != null) {
    params.append("limit", filters.limit.toString());
  }

  const response = await fetch(
    `${API_URL}/room?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return response.json();
};

export const getRoom = async (id: number) => {
  const response = await fetch(`${API_URL}/room/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch room");
  }

  return response.json();
};

export async function createRoom(
  data: CreateRoomDto
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create room."
    );
  }

  return result;
}

export async function updateRoom(
  id: number,
  data: Partial<CreateRoomDto>
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/room/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update room."
    );
  }

  return result;
}

export async function deleteRoom(id: number) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/room/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.message || "Failed to delete room."
    );
  }
}

// Submits into a moderation queue, not straight onto the listing — see
// RoomService.addReview on the backend. The name shown alongside the
// review comes from the submitter's own account, not a field in this
// payload, so it can't be spoofed.
export async function submitReview(
  roomId: number,
  data: { rating: number; comment: string }
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/room/${roomId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit review.");
  }

  return result;
}
