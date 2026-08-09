const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface BookingSchedule {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface BookingSettings {
  id: number;
  bookingsEnabled: boolean;
  slotDurationMinutes: number;
  bufferMinutes: number;
  requiresApproval: boolean;
  schedule: BookingSchedule;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  customer?: {
    id: number;
    firstName: string;
    surname: string;
    phoneNumber?: string | null;
  };
  business?: {
    id: number;
    name: string;
  };
}

export interface AvailabilitySlot {
  start: string;
  end: string;
}

export interface AvailabilityResponse {
  enabled: boolean;
  slotDurationMinutes: number | null;
  slots: AvailabilitySlot[];
}

export interface BlockedSlot {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handle<T>(response: Response, fallbackMessage: string): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }
  return result;
}

export async function getBookingSettings(businessId: number) {
  const res = await fetch(`${API_URL}/business/${businessId}/booking-settings`, {
    headers: authHeaders(),
  });
  return handle<BookingSettings>(res, "Failed to load booking settings.");
}

export async function updateBookingSettings(
  businessId: number,
  data: Partial<
    Pick<
      BookingSettings,
      "bookingsEnabled" | "slotDurationMinutes" | "bufferMinutes" | "requiresApproval"
    >
  > & { schedule?: Partial<BookingSchedule> },
) {
  const res = await fetch(`${API_URL}/business/${businessId}/booking-settings`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle<BookingSettings>(res, "Failed to update booking settings.");
}

export async function getAvailability(businessId: number, date: string) {
  const res = await fetch(
    `${API_URL}/business/${businessId}/availability?date=${date}`,
  );
  return handle<AvailabilityResponse>(res, "Failed to load availability.");
}

export async function createBooking(
  businessId: number,
  data: { date: string; startTime: string; notes?: string },
) {
  const res = await fetch(`${API_URL}/business/${businessId}/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle<Booking>(res, "Failed to create booking.");
}

export async function getBusinessBookings(businessId: number) {
  const res = await fetch(`${API_URL}/business/${businessId}/bookings`, {
    headers: authHeaders(),
  });
  return handle<Booking[]>(res, "Failed to load bookings.");
}

export async function getMyBookings() {
  const res = await fetch(`${API_URL}/bookings/mine`, {
    headers: authHeaders(),
  });
  return handle<Booking[]>(res, "Failed to load your bookings.");
}

export async function updateBookingStatus(bookingId: number, status: BookingStatus) {
  const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handle<Booking>(res, "Failed to update booking.");
}

export async function getBlockedSlots(businessId: number) {
  const res = await fetch(`${API_URL}/business/${businessId}/blocked-slots`, {
    headers: authHeaders(),
  });
  return handle<BlockedSlot[]>(res, "Failed to load blocked dates.");
}

export async function createBlockedSlot(
  businessId: number,
  data: { date: string; startTime?: string; endTime?: string; reason?: string },
) {
  const res = await fetch(`${API_URL}/business/${businessId}/blocked-slots`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle<BlockedSlot>(res, "Failed to block that date.");
}

export async function removeBlockedSlot(id: number) {
  const res = await fetch(`${API_URL}/blocked-slots/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle<BlockedSlot>(res, "Failed to remove blocked date.");
}
