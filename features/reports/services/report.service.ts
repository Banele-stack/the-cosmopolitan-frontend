const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateReportDto {
  targetType: "room" | "business" | "gig";
  targetId: number;
  reason: string;
}

export async function createReport(dto: CreateReportDto) {
  const token = localStorage.getItem("token");

  // Reporting requires login (the backend guards this route with
  // JwtAuthGuard) — but without this check, a logged-out caller still
  // sent `Authorization: Bearer null` (the literal string), which the JWT
  // library rejects as "jwt malformed" rather than "not logged in". Fail
  // with a clear message here instead of letting that raw library error
  // reach the user — ReportModal checks login before ever calling this,
  // so this is the backstop for anyone bypassing that.
  if (!token) {
    throw new Error("You need to be logged in to report a listing.");
  }

  const response = await fetch(`${API_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit report.");
  }

  return result;
}
