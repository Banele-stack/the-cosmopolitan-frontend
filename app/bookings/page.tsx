"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import {
  Booking,
  getMyBookings,
  updateBookingStatus,
} from "@/features/bookings/services/booking.service";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-50 text-blue-700",
  no_show: "bg-red-50 text-red-700",
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message || "Failed to load your bookings."))
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id: number) => {
    setCancellingId(id);
    try {
      const updated = await updateBookingStatus(id, "cancelled");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      );
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={28} />
      </main>
    );
  }

  const upcoming = bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const past = bookings
    .filter((b) => !["pending", "confirmed"].includes(b.status))
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/auth/account")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to account
        </button>

        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
          My Bookings
        </h1>
        <p className="text-gray-500 mt-1">
          Appointments you've booked with local businesses.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-violet-600" />
            <h2 className="font-semibold text-gray-900">Upcoming</h2>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">
              No upcoming bookings — browse businesses and hit "Book Now" on a listing to schedule one.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <button
                      onClick={() => b.business && router.push(`/business/${b.business.id}`)}
                      className="font-medium text-gray-900 hover:text-violet-600 transition-colors text-left"
                    >
                      {b.business?.name ?? "Listing"}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Clock size={12} />
                      {b.date} · {b.startTime}–{b.endTime}
                    </div>
                    {b.notes && (
                      <p className="text-xs text-gray-400 mt-1">"{b.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[b.status]}`}
                    >
                      {b.status}
                    </span>

                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500">Past</h3>
              <div className="mt-3 space-y-2">
                {past.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm"
                  >
                    <span className="text-gray-600">
                      {b.business?.name ?? "Listing"} — {b.date} · {b.startTime}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
