"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Loader2, CheckCircle2 } from "lucide-react";
import {
  AvailabilitySlot,
  Booking,
  createBooking,
  getAvailability,
} from "@/features/bookings/services/booking.service";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Self-contained: checks the public availability endpoint on mount and
// renders nothing at all if this business hasn't turned bookings on —
// callers don't need to know that ahead of time.
export default function BookingWidget({ businessId }: { businessId: number }) {
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  // Initial check — is this business even bookable?
  useEffect(() => {
    getAvailability(businessId, todayISO())
      .then((res) => setEnabled(res.enabled))
      .catch(() => setEnabled(false))
      .finally(() => setChecked(true));
  }, [businessId]);

  // Re-fetch slots whenever the selected date changes (only once enabled).
  useEffect(() => {
    if (!enabled) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailability(businessId, date)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [businessId, date, enabled]);

  const handleBook = async () => {
    if (!selectedSlot) return;

    if (!localStorage.getItem("token")) {
      router.push(`/auth/login?next=/business/${businessId}`);
      return;
    }

    setBooking(true);
    setError("");
    try {
      const result = await createBooking(businessId, {
        date,
        startTime: selectedSlot.start,
        notes: notes || undefined,
      });
      setConfirmed(result);
    } catch (err: any) {
      setError(err.message || "That slot was just taken — please pick another.");
      // Refresh slots since the one they picked may no longer be free.
      getAvailability(businessId, date).then((res) => setSlots(res.slots));
    } finally {
      setBooking(false);
    }
  };

  if (!checked || !enabled) return null;

  if (confirmed) {
    return (
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 flex items-start gap-3">
        <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-semibold text-green-800">
            {confirmed.status === "pending" ? "Booking requested" : "Booking confirmed"}
          </p>
          <p className="text-sm text-green-700 mt-0.5">
            {confirmed.date} at {confirmed.startTime}
            {confirmed.status === "pending"
              ? " — you'll be notified once the business confirms it."
              : "."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 p-5">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        <CalendarCheck size={19} className="text-violet-600" />
        Book an appointment
      </h2>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
        <input
          type="date"
          min={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
          <Clock size={12} />
          Available times
        </label>

        {loadingSlots ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
            <Loader2 size={14} className="animate-spin" />
            Loading…
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No open slots on this date — try another day.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  selectedSlot?.start === slot.start
                    ? "bg-violet-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:border-violet-300"
                }`}
              >
                {slot.start}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything the business should know ahead of time"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
          />

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <button
            onClick={handleBook}
            disabled={booking}
            className="mt-3 w-full h-11 rounded-xl bg-violet-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {booking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              `Book ${date} at ${selectedSlot.start}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
