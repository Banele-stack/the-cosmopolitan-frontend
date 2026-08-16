"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Settings2,
  CalendarX,
  Trash2,
  Loader2,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Business, getBusiness } from "@/features/business/services/business.service";
import {
  BookingSettings,
  Booking,
  BlockedSlot,
  BookingSchedule,
  getBookingSettings,
  updateBookingSettings,
  getBusinessBookings,
  updateBookingStatus,
  getBlockedSlots,
  createBlockedSlot,
  removeBlockedSlot,
} from "@/features/bookings/services/booking.service";

const DAYS: { key: keyof BookingSchedule; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-50 text-blue-700",
  no_show: "bg-red-50 text-red-700",
};

function parseWindow(hours: string): [string, string] {
  if (!hours || hours === "Closed") return ["09:00", "17:00"];
  const [start, end] = hours.split(" - ");
  return [start ?? "09:00", end ?? "17:00"];
}

export default function BusinessBookingsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = Number(params?.id);

  const [business, setBusiness] = useState<Business | null>(null);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    if (!businessId) return;

    Promise.all([
      getBusiness(businessId),
      getBookingSettings(businessId),
      getBusinessBookings(businessId),
      getBlockedSlots(businessId),
    ])
      .then(([b, s, bk, bl]) => {
        setBusiness(b);
        setSettings(s);
        setBookings(bk);
        setBlockedSlots(bl);
      })
      .catch((err) => setError(err.message || "Failed to load bookings."))
      .finally(() => setLoading(false));
  }, [businessId]);

  const saveSettings = async (patch: Partial<BookingSettings>) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateBookingSettings(businessId, patch);
      setSettings(updated);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const setDayWindow = (day: keyof BookingSchedule, closed: boolean, start: string, end: string) => {
    if (!settings) return;
    const nextSchedule = {
      ...settings.schedule,
      [day]: closed ? "Closed" : `${start} - ${end}`,
    };
    setSettings({ ...settings, schedule: nextSchedule });
  };

  const handleBookingStatus = async (id: number, status: any) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
    } catch (err: any) {
      setError(err.message || "Failed to update booking.");
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockDate) return;
    try {
      const created = await createBlockedSlot(businessId, {
        date: newBlockDate,
        reason: newBlockReason || undefined,
      });
      setBlockedSlots((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setNewBlockDate("");
      setNewBlockReason("");
    } catch (err: any) {
      setError(err.message || "Failed to block date.");
    }
  };

  const deleteBlockedDate = async (id: number) => {
    try {
      await removeBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove blocked date.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={28} />
      </main>
    );
  }

  if (error && !settings) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-violet-600 font-medium hover:underline"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = bookings.filter((b) => !["pending", "confirmed"].includes(b.status));

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push(`/business/${businessId}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to listing
        </button>

        <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
          Bookings — {business?.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Manage availability and appointments for this listing.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* SETTINGS */}
        {settings && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-violet-600" />
                <h2 className="font-semibold text-gray-900">Booking Settings</h2>
              </div>

              <button
                onClick={() => saveSettings({ bookingsEnabled: !settings.bookingsEnabled })}
                disabled={saving}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  settings.bookingsEnabled ? "bg-violet-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.bookingsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              {settings.bookingsEnabled
                ? "Bookings are on — customers can see \"Book Now\" on your listing."
                : "Bookings are off — turn this on once your schedule below looks right."}
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Appointment length
                </label>
                <select
                  value={settings.slotDurationMinutes}
                  onChange={(e) =>
                    saveSettings({ slotDurationMinutes: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-violet-400"
                >
                  {SLOT_DURATIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Buffer between appointments
                </label>
                <select
                  value={settings.bufferMinutes}
                  onChange={(e) => saveSettings({ bufferMinutes: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-violet-400"
                >
                  {[0, 5, 10, 15, 30].map((m) => (
                    <option key={m} value={m}>
                      {m === 0 ? "None" : `${m} minutes`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.requiresApproval}
                onChange={(e) => saveSettings({ requiresApproval: e.target.checked })}
                className="rounded border-gray-300"
              />
              Require my approval before a booking is confirmed
            </label>

            {/* Weekly schedule */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 mb-2">Weekly schedule</p>
              <div className="space-y-2">
                {DAYS.map(({ key, label }) => {
                  const raw = settings.schedule[key];
                  const closed = !raw || raw === "Closed";
                  const [start, end] = parseWindow(raw);

                  return (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 text-gray-600">{label}</span>

                      <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                        <input
                          type="checkbox"
                          checked={!closed}
                          onChange={(e) =>
                            setDayWindow(key, !e.target.checked, start, end)
                          }
                          className="rounded border-gray-300"
                        />
                        Open
                      </label>

                      {!closed ? (
                        <>
                          <input
                            type="time"
                            value={start}
                            onChange={(e) => setDayWindow(key, false, e.target.value, end)}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={end}
                            onChange={(e) => setDayWindow(key, false, start, e.target.value)}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => saveSettings({ schedule: settings.schedule })}
                disabled={saving}
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save schedule"}
              </button>
            </div>
          </div>
        )}

        {/* BLOCKED DATES */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <CalendarX size={18} className="text-violet-600" />
            <h2 className="font-semibold text-gray-900">Blocked Dates</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Days you're not available — public holidays, time off, fully booked elsewhere.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Reason (optional)
              </label>
              <input
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="e.g. Public holiday"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={addBlockedDate}
              disabled={!newBlockDate}
              className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition disabled:opacity-40"
            >
              Block date
            </button>
          </div>

          {blockedSlots.length > 0 && (
            <div className="mt-4 space-y-2">
              {blockedSlots.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="text-gray-700">
                    {b.date}
                    {b.reason ? ` — ${b.reason}` : ""}
                  </span>
                  <button
                    onClick={() => deleteBlockedDate(b.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOOKINGS */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-violet-600" />
            <h2 className="font-semibold text-gray-900">Upcoming Bookings</h2>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">No upcoming bookings yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {b.customer?.firstName} {b.customer?.surname}
                    </p>
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

                    {b.status === "pending" && (
                      <button
                        onClick={() => handleBookingStatus(b.id, "confirmed")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                      >
                        Confirm
                      </button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button
                        onClick={() => handleBookingStatus(b.id, "cancelled")}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleBookingStatus(b.id, "completed")}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                          Mark done
                        </button>
                        <button
                          onClick={() => handleBookingStatus(b.id, "no_show")}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                          No-show
                        </button>
                      </>
                    )}
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
                      {b.customer?.firstName} {b.customer?.surname} — {b.date} · {b.startTime}
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
