"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
  Truck,
  Video,
  Flag,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import BusinessReviewsSection from "@/features/business/components/BusinessReviewsSection";
import BookingWidget from "@/features/bookings/components/BookingWidget";
import { Business, getBusiness, deleteBusiness } from "@/features/business/services/business.service";
import { getProfile } from "@/features/auth/services/auth.service";
import ReportModal from "@/features/reports/components/ReportModal";
import ListingStats from "@/components/common/ListingStats";
import TikTokFollow from "@/components/common/TikTokFollow";
import SocialLinkButton from "@/components/common/SocialLinkButton";
import ShareButton from "@/components/common/ShareButton";
import Button, { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordView, recordContactClick } from "@/features/analytics/services/analytics.service";

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/placeholder.svg";
};

// Uploaded business media is stored as a path relative to the API origin
// (e.g. "/uploads/business/..."); seed data uses full external URLs already.
const getMediaUrl = (path?: string) => {
  if (!path) {
    return undefined;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export default function BusinessPage() {
  const router = useRouter();
  const params = useParams();

const id = Number(params?.id);

const [business, setBusiness] = useState<Business | null>(null);
const [loading, setLoading] = useState(true);

  const [reportOpen, setReportOpen] = useState(false);

  // Best-effort ownership check, same pattern as the gig detail page — used
  // only to decide whether to show the owner-only ListingStats panel and to
  // skip counting the owner's own visits as a view.
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ IMAGE GALLERY STATE (NEW)
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // 👉 USER LOCATION
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // With the browser's own scroll restoration turned off app-wide (see
  // ScrollRestorationManager), every page has to explicitly decide where
  // it starts — this keeps two different business listings visited back
  // to back from inheriting whatever scroll depth the previous one left.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

useEffect(() => {
  const fetchBusiness = async () => {
    try {
      const data = await getBusiness(id);
      setBusiness(data);
    } catch (error) {
      console.error("Failed to fetch business:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isNaN(id)) {
    fetchBusiness();
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }
}, [id]);

  useEffect(() => {
    if (!business) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setOwnerCheckDone(true);
      return;
    }

    getProfile()
      .then((profile) => setIsOwner(profile.id === business.ownerId))
      .catch(() => {})
      .finally(() => setOwnerCheckDone(true));
  }, [business]);

  // Record a view once we know whether this is the owner browsing their own
  // listing — the owner's own visits don't count. See ListingStats for
  // where this shows up.
  useEffect(() => {
    if (!business || !ownerCheckDone || isOwner) return;
    recordView("business", business.id);
  }, [business, ownerCheckDone, isOwner]);

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        Loading...
      </div>
    </div>
  );
}

if (!business) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-500">
        Business not found
      </div>
    </div>
  );
}

  const isPhysical = business.businessType === "physical";

  const hasCoordinates =
    isPhysical &&
    business.location?.lat != null &&
    business.location?.lng != null;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.location!.lat},${business.location!.lng}`
    : undefined;

  const days: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const distance =
    userLocation && hasCoordinates
      ? getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          business.location!.lat!,
          business.location!.lng!
        )
      : null;

  const phoneNumber = business.phoneNumber;

  const whatsappLink = business.whatsappNumber
    ? `https://wa.me/${business.whatsappNumber.replace(/[^0-9+]/g, "")}?text=Hi%20I%20want%20to%20enquire%20about%20your%20services`
    : undefined;

  async function handleDelete() {
    if (!business) return;
    if (!confirm(`Delete "${business.name}"? This can't be undone.`)) return;

    setDeleting(true);

    try {
      await deleteBusiness(business.id);
      toast.success("Business deleted");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">

        {/* BACK + SHARE */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <ShareButton
            title={business.name}
            text={`Check out ${business.name} on The Cosmopolitan`}
          />
        </div>

        {/* ✅ HERO IMAGE GALLERY (UPDATED) */}
        <div className="bg-white rounded-2xl p-2 shadow-sm">
          <div className="relative">

            <div
              className="relative h-[220px] sm:h-[280px] md:h-[380px] w-full overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setGalleryOpen(true)}
            >
              {/* next/image: automatic resize + WebP/AVIF + responsive
                  srcset, so a phone downloads a copy sized for this box
                  instead of the original upload (up to 5MB). `priority`,
                  not lazy — this is the page's LCP element. */}
              <Image
                src={getMediaUrl(business.images[selectedImage]) || "/placeholder.svg"}
                alt={business.name}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                onError={onImgError}
                className="object-cover"
              />
            </div>

            {/* LEFT */}
            {business.images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? business.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow flex items-center justify-center"
              >
                ‹
              </button>
            )}

            {/* RIGHT */}
            {business.images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === business.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow flex items-center justify-center"
              >
                ›
              </button>
            )}

            {/* COUNTER */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {business.images.length}
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {business.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index
                    ? "border-violet-600"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={getMediaUrl(image) || "/placeholder.svg"}
                  alt={`${business.name}-${index}`}
                  onError={onImgError}
                  loading="lazy"
                  width={96}
                  height={80}
                  className="w-24 h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-6">

          {/* LEFT */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {business.name}
            </h1>

            <p className="text-violet-600 font-medium mt-2">
              {business.category?.name}
              {business.subcategory && ` › ${business.subcategory.name}`}
            </p>

            {business.credential && (
              <div className="flex items-center gap-1.5 mt-2 text-amber-700">
                <GraduationCap size={16} className="shrink-0" />
                <span className="text-sm font-medium">
                  {business.credential}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              {isPhysical && business.location?.address && (
                <div className="flex items-center gap-1">
                  <MapPin size={15} />
                  {business.location.address}
                </div>
              )}

              {distance !== null && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  📍 {distance.toFixed(1)} km from you
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                {business.rating}
              </div>

              {business.ownerVerified && (
                <div className="flex items-center gap-1 text-green-600">
                  <ShieldCheck size={15} />
                  Phone Verified
                </div>
              )}

              {business.supportsDelivery && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Truck size={15} />
                  Delivery available
                </div>
              )}
            </div>

            {/* Sidebar (desktop) hides on mobile, so this is the only place
                mobile sees it — the fixed bottom bar below is reserved for
                Call/WhatsApp/Edit and is too tight to fit a 4th action. */}
            <div className="lg:hidden">
              <TikTokFollow url={business.ownerTiktokUrl} />
              <SocialLinkButton url={business.ownerSocialUrl} />
            </div>

            {isOwner && (
              <ListingStats
                viewCount={business.viewCount}
                contactClickCount={business.contactClickCount}
              />
            )}

            <BookingWidget businessId={business.id} />

            {/* ABOUT */}
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">
                About this business
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {business.description}
              </p>
            </div>

            {/* VIDEOS */}
            {business.videos && business.videos.length > 0 && (
              <div className="mt-10">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Video size={18} />
                  Videos
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {business.videos.map((videoUrl, index) => (
                    <video
                      key={index}
                      src={getMediaUrl(videoUrl)}
                      controls
                      className="w-full rounded-xl bg-black aspect-video"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* LOCATION (physical businesses only) */}
            {hasCoordinates && (
              <div className="mt-10">
                <h2 className="font-semibold text-lg mb-4">
                  Location
                </h2>

                <div className="rounded-2xl overflow-hidden mt-3">
                  <iframe
                    width="100%"
                    height="250"
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${business.location!.lat},${business.location!.lng}&z=17&output=embed`}
                  />
                </div>

                <div className="mt-3">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block bg-violet-600 text-white py-3 rounded-xl text-center"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            )}

            <BusinessReviewsSection
              rating={business.rating}
              reviewCount={business.reviewCount ?? 0}
            />
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block">
            <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg">

              {phoneNumber ? (
                <a
                  href={`tel:${phoneNumber}`}
                  onClick={() => recordContactClick("business", business.id)}
                  className={cn(buttonVariants({ variant: "solid", tone: "violet" }), "mt-5 w-full")}
                >
                  <Phone size={16} />
                  Call Business
                </a>
              ) : (
                <Button
                  disabled
                  variant="muted"
                  className="mt-5 w-full"
                  title="This listing hasn't added a contact number yet"
                >
                  <Phone size={16} />
                  No number listed
                </Button>
              )}

              {business.supportsWhatsAppOrder && whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  onClick={() => recordContactClick("business", business.id)}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
                >
                  <MessageCircle size={16} />
                  Order via WhatsApp
                </a>
              )}

              {business.supportsDelivery && (
                <div className="mt-3 w-full rounded-xl bg-blue-50 py-2.5 text-center text-sm font-medium text-blue-700 flex items-center justify-center gap-2">
                  <Truck size={16} />
                  Delivery available
                </div>
              )}

              <TikTokFollow url={business.ownerTiktokUrl} />
              <SocialLinkButton url={business.ownerSocialUrl} />

              {isOwner ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => router.push(`/business/${business.id}/edit`)}
                    variant="outline"
                    className="w-full"
                  >
                    <Pencil size={16} />
                    Edit
                  </Button>

                  <Button
                    onClick={handleDelete}
                    loading={deleting}
                    variant="danger-outline"
                    className="w-full"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setReportOpen(true)}
                  className="mt-4 w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Report this business
                </button>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CTA — same layout as the room detail page's mobile bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 border-t">
        <div
          className={`grid gap-2 ${
            business.supportsWhatsAppOrder && whatsappLink
              ? "grid-cols-[1fr_1fr_auto]"
              : "grid-cols-[1fr_auto]"
          }`}
        >
          {/* CALL */}
          {phoneNumber ? (
            <a
              href={`tel:${phoneNumber}`}
              onClick={() => recordContactClick("business", business.id)}
              className={cn(buttonVariants({ variant: "solid", tone: "violet", size: "sm" }), "h-11")}
            >
              <Phone size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Call</span>
            </a>
          ) : (
            <Button
              disabled
              variant="muted"
              size="sm"
              className="h-11"
              title="This listing hasn't added a contact number yet"
            >
              <Phone size={16} className="shrink-0" />
              <span className="whitespace-nowrap">No number</span>
            </Button>
          )}

          {/* WHATSAPP */}
          {business.supportsWhatsAppOrder && whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordContactClick("business", business.id)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11")}
            >
              <MessageCircle size={16} className="shrink-0 text-green-600" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>
          )}

          {/* Owner sees Edit here instead of Report — reporting your own
              listing makes no sense. Delete stays desktop-sidebar-only to
              avoid a destructive action sitting in the easy-to-mistap
              bottom bar. */}
          {isOwner ? (
            <Button
              onClick={() => router.push(`/business/${business.id}/edit`)}
              variant="outline"
              size="sm"
              className="h-11 px-3"
            >
              <Pencil size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Edit</span>
            </Button>
          ) : (
            // REPORT — labeled, not just an icon, so it reads as "tap to
            // report" rather than "this listing has been flagged".
            <Button
              onClick={() => setReportOpen(true)}
              variant="danger-outline"
              size="sm"
              className="h-11 px-3"
            >
              <Flag size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Report</span>
            </Button>
          )}
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20 lg:hidden" />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="business"
        targetId={business.id}
        title="Report Business"
        reasonOptions={[
          "Fake business",
          "Scam / fraud",
          "Wrong information",
          "Inappropriate content",
        ]}
      />
    </main>
  );
}
