const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ListingStatus = "active" | "pending_review" | "suspended";
export type ReviewStatus = "approved" | "rejected";

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  listings: { rooms: number; businesses: number; gigs: number };
  pending: { listings: number; reports: number; reviews: number };
}

export interface PendingReview {
  roomId: number;
  roomName: string;
  review: {
    id: string;
    reviewerId: number;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
  };
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handle(response: Response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

export async function getListings(status: ListingStatus = "pending_review") {
  const response = await fetch(
    `${API_URL}/admin/listings?status=${status}`,
    { headers: authHeaders() },
  );

  return handle(response);
}

export async function getReports() {
  const response = await fetch(`${API_URL}/admin/reports`, {
    headers: authHeaders(),
  });

  return handle(response);
}

export async function updateRoomStatus(id: number, status: ListingStatus) {
  const response = await fetch(`${API_URL}/admin/rooms/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  return handle(response);
}

export async function updateBusinessStatus(id: number, status: ListingStatus) {
  const response = await fetch(`${API_URL}/admin/business/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  return handle(response);
}

export async function updateGigStatus(id: number, status: ListingStatus) {
  const response = await fetch(`${API_URL}/admin/gigs/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  return handle(response);
}

export async function getStats(): Promise<AdminStats> {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: authHeaders(),
  });

  return handle(response);
}

export async function getPendingReviews(): Promise<PendingReview[]> {
  const response = await fetch(`${API_URL}/admin/reviews`, {
    headers: authHeaders(),
  });

  return handle(response);
}

export async function updateReviewStatus(
  roomId: number,
  reviewId: string,
  status: ReviewStatus
) {
  const response = await fetch(
    `${API_URL}/admin/reviews/${roomId}/${reviewId}/status`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }
  );

  return handle(response);
}
