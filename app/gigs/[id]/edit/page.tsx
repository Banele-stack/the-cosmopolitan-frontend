"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { getGig, updateGig } from "@/features/gigs/services/gig.service";
import { getProfile } from "@/features/auth/services/auth.service";
import { GigPriceType, GigType, GigUrgency } from "@/features/gigs/types";

// Same single-screen form as create — see that page's note on why this
// isn't a multi-step wizard. Differences from create: prefills from the
// existing post, PATCHes instead of POSTing, and gates on ownership (not
// just being logged in) before showing the form at all.
export default function EditGigPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Distinct from isLoggedIn: this gig might belong to someone else
  // entirely, in which case the form still shouldn't render even though
  // the visitor is authenticated.
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

  useEffect(() => {
    getBusinessCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setAuthChecked(true);

    if (!token || isNaN(id)) {
      setOwnerCheckDone(true);
      return;
    }

    (async () => {
      try {
        const [gig, profile] = await Promise.all([getGig(id), getProfile()]);

        if (profile.id !== gig.ownerId) {
          setIsOwner(false);
          return;
        }

        setIsOwner(true);
        setForm({
          type: gig.type,
          title: gig.title,
          description: gig.description,
          categorySlug: gig.category?.slug ?? "",
          subcategorySlug: gig.subcategory?.slug ?? "",
          urgency: gig.urgency,
          price: gig.price != null ? String(gig.price) : "",
          priceType: gig.priceType,
          address: gig.location.address,
          area: gig.location.area,
          lat: gig.location.lat,
          lng: gig.location.lng,
          whatsappNumber: gig.whatsappNumber,
        });
      } catch (err) {
        console.error("Failed to load gig:", err);
        setNotFound(true);
      } finally {
        setOwnerCheckDone(true);
      }
    })();
  }, [id]);

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
      alert("Please confirm the location on the map before saving.");
      return;
    }

    try {
      setLoading(true);

      await updateGig(id, {
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

      toast.success("Piece job updated", {
        description: `"${form.title}" has been saved.`,
      });

      router.push(`/gigs/${id}`);
    } catch (error: any) {
      alert(error.message || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Hold the page blank until both the auth and ownership checks resolve,
  // same reasoning as create's authChecked guard — avoids a form flash.
  if (!authChecked || !ownerCheckDone) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <Navbar />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <Navbar />

        <AuthGate
          nextPath={`/gigs/${id}/edit`}
          title="Sign in to edit this post"
          message="Log in with the account that posted it."
          browseHref="/?view=gigs"
        />
      </main>
    );
  }

  if (notFound || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          {notFound
            ? "Piece job not found."
            : "You can only edit your own posts."}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Edit Piece Job
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          Update the details below — changes go live as soon as you save.
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
            <p className="mt-2 text-xs text-gray-400">
              Changing this resets how long the post stays visible, same as
              when it was first posted.
            </p>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
