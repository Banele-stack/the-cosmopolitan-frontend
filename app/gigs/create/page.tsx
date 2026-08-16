"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AuthGate from "@/components/ui/AuthGate";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import LocationPinPicker from "@/components/ui/LocationPinPicker";
import { getBusinessCategories } from "@/features/business/services/business.service";
import { BusinessCategory } from "@/features/business/types";
import { createGig } from "@/features/gigs/services/gig.service";
import { GigPriceType, GigType, GigUrgency } from "@/features/gigs/types";

// Deliberately a single short screen, not a multi-step wizard like the
// room/business create flows — the whole point of a same-day task board is
// posting in under a minute, so the form should get out of the way.
export default function CreateGigPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  // Posting a piece job requires an account (so people can be reached back). Gate
  // on the client, same as Navbar's isLoggedIn check — there's no server
  // session here, just a token in localStorage.
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    getBusinessCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const [form, setForm] = useState({
    type: "need_help" as GigType,
    title: "",
    description: "",
    categorySlug: "",
    subcategorySlug: "",
    urgency: "today" as GigUrgency,
    price: "",
    priceType: "negotiable" as GigPriceType,
    address: "",
    area: "",
    lat: null as number | null,
    lng: null as number | null,
    whatsappNumber: "",
  });

  const activeCategory = categories.find((c) => c.slug === form.categorySlug);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categorySlug" ? { subcategorySlug: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.lat == null || form.lng == null) {
      alert("Please confirm the location on the map before posting.");
      return;
    }

    try {
      setLoading(true);

      await createGig({
        type: form.type,
        title: form.title,
        description: form.description,
        categorySlug: form.categorySlug || undefined,
        subcategorySlug: form.subcategorySlug || undefined,
        price: form.price ? Number(form.price) : undefined,
        priceType: form.priceType,
        urgency: form.urgency,
        location: {
          address: form.address,
          area: form.area,
          lat: form.lat,
          lng: form.lng,
        },
        whatsappNumber: form.whatsappNumber,
      });

      toast.success("Piece job posted!", {
        description: `"${form.title}" is now live on the Piece Jobs feed.`,
      });

      router.push("/?view=gigs");
    } catch (error: any) {
      alert(error.message || "Failed to post piece job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Hold the page blank until the auth check resolves, so a logged-out
  // visitor never sees the form flash before the sign-in prompt swaps in.
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <Navbar />
      </main>
    );
  }

  // Not logged in — don't render the form at all, prompt to sign in first.
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <Navbar />

        <AuthGate
          nextPath="/gigs/create"
          title="Sign in to post a piece job"
          message="Create a free account or log in so people can reach you about it."
          browseHref="/?view=gigs"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Post a Piece Job
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          Need something done today, or free to help someone nearby? Post it
          — no forms, no fuss.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* TYPE */}
          <div className="flex rounded-xl bg-white border border-gray-200 p-1">
            {(
              [
                { value: "need_help", label: "I Need Help" },
                { value: "offering_work", label: "I Can Help" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, type: option.value }))
                }
                className={`flex-1 h-11 rounded-lg text-sm font-semibold transition ${
                  form.type === option.value
                    ? "bg-violet-600 text-white shadow"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === "need_help"
                ? "What do you need done?"
                : "What can you help with?"}
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder={
                form.type === "need_help"
                  ? "e.g. Help moving furniture on Saturday"
                  : "e.g. Available for gardening and yard work today"
              }
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="A few more details — what, when, and anything else worth knowing."
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm resize-none"
            />
          </div>

          {/* CATEGORY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categorySlug"
                value={form.categorySlug}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm appearance-none"
              >
                <option value="">Not sure / other</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {activeCategory && activeCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific skill
                </label>
                <select
                  name="subcategorySlug"
                  value={form.subcategorySlug}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm appearance-none"
                >
                  <option value="">Any</option>
                  {activeCategory.subcategories.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* URGENCY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              When
            </label>
            <div className="flex gap-2">
              {(
                [
                  { value: "today", label: "Today" },
                  { value: "this_week", label: "This Week" },
                  { value: "flexible", label: "Flexible" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, urgency: option.value }))
                  }
                  className={`flex-1 h-11 rounded-xl text-sm font-medium border transition ${
                    form.urgency === option.value
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-violet-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (optional)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="R"
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <select
                name="priceType"
                value={form.priceType}
                onChange={handleChange}
                className="h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm appearance-none"
              >
                <option value="negotiable">Negotiable</option>
                <option value="fixed">Fixed</option>
                <option value="hourly">Per hour</option>
              </select>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <AddressAutocomplete
              value={form.address}
              onInputChange={(text) =>
                setForm((prev) => ({ ...prev, address: text }))
              }
              onSelect={(result: GeocodeResult) =>
                setForm((prev) => ({
                  ...prev,
                  address: result.address,
                  area: result.area || result.address,
                  lat: result.lat,
                  lng: result.lng,
                }))
              }
              placeholder="Street, suburb..."
              inputClassName="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm"
              showUseCurrentLocation
            />

            <p className="mt-2 text-xs text-gray-400">
              Easiest: tap &quot;Use my current location&quot; above while
              you&apos;re there. Or drag the pin below to fine-tune the exact
              spot.
            </p>

            <LocationPinPicker
              className="mt-2 h-48 w-full rounded-xl overflow-hidden border border-gray-200"
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) =>
                setForm((prev) => ({ ...prev, lat, lng }))
              }
            />
          </div>

          {/* WHATSAPP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp number
            </label>
            <input
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              required
              placeholder="e.g. 0821234567"
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none text-sm"
            />
            <p className="mt-2 text-xs text-gray-400">
              This is how people will reach you — Piece Jobs doesn't handle
              payments, so meet safely and agree on payment directly.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition shadow-lg disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Posting...
              </>
            ) : (
              "Post Piece Job"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
