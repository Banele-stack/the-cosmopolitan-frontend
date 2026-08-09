"use client";

import { useEffect, useState } from "react";
import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
  Building2,
  BedDouble,
  Bath,
  Ruler,
  Home,
  Car,
  Wifi,
  UtensilsCrossed,
  Volume2,
  CigaretteOff,
  Sofa,
  Lamp,
  Zap,
  Droplets,
  PawPrint,
  Video,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import ReviewSection from "@/features/rooms/components/ReviewSection";
import { getRoom, deleteRoom } from "@/features/rooms/services/room.service";
import { getProfile } from "@/features/auth/services/auth.service";
import ReportModal from "@/features/reports/components/ReportModal";
import ListingStats from "@/components/common/ListingStats";
import Button, { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordView, recordContactClick } from "@/features/analytics/services/analytics.service";
import { Room } from "@/features/rooms/types";

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/placeholder.svg";
};

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the API URL
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Best-effort ownership check, same pattern as the gig/business detail
  // pages — used only to decide whether to show the owner-only
  // ListingStats panel and to skip counting the owner's own visits.
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);
  
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await getRoom(Number(id));
        setRoom(data);
      } catch (err) {
        console.error("Failed to fetch room", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  useEffect(() => {
    if (!room) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setOwnerCheckDone(true);
      return;
    }

    getProfile()
      .then((profile) => setIsOwner(profile.id === room.ownerId))
      .catch(() => {})
      .finally(() => setOwnerCheckDone(true));
  }, [room]);

  // Record a view once we know whether this is the owner browsing their own
  // listing — the owner's own visits don't count. See ListingStats for
  // where this shows up.
  useEffect(() => {
    if (!room || !ownerCheckDone || isOwner) return;
    recordView("room", Number(room.id));
  }, [room, ownerCheckDone, isOwner]);

  const avgRating =
    room?.reviews && room.reviews.length > 0
      ? room.reviews.reduce(
          (a: number, r: { rating: number }) => a + r.rating,
          0
        ) / room.reviews.length
      : 0;

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-ZA").format(value);
  }

  // 👉 DISTANCE (Haversine)
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

  // Uses the room's real coordinates; falls back to Johannesburg CBD only
  // for the rare listing that genuinely has none, so the map, directions,
  // distance-from-you, and the load-shedding widget all agree on where the
  // room actually is.
  const coords = useMemo(() => {
    if (room?.location?.lat != null && room?.location?.lng != null) {
      return {
        lat: room.location.lat,
        lng: room.location.lng,
      };
    }

    return {
      lat: -26.2041,
      lng: 28.0473,
    };
  }, [room]);

  const distance = userLocation
    ? getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      coords.lat,
      coords.lng
    )
    : null;

  // 👉 CONTACT — per-listing, falls back to the owner's phone number if no
  // separate WhatsApp number was given when the listing was created.
  const phoneNumber = room?.phoneNumber ?? null;
  const whatsappNumber = room?.whatsappNumber || room?.phoneNumber || null;

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9+]/g, "")}?text=Hi%20I%20am%20interested%20in%20your%20room%20listing`
    : undefined;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Loading room...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Room not found
        </div>
      </div>
    );
  }

  // Process images to full URLs
  const processedImages = room.images.map(getImageUrl);

  async function handleDelete() {
    if (!room) return;
    if (!confirm(`Delete "${room.name}"? This can't be undone.`)) return;

    setDeleting(true);

    try {
      await deleteRoom(Number(room.id));
      toast.success("Property deleted");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">

        {/* BACK */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* IMAGE */}
        {/* GALLERY */}
        <div className="bg-white rounded-2xl p-2 shadow-sm">
          <div className="relative">

            <img
              src={processedImages[selectedImage]}
              alt={room.name}
              onClick={() => setGalleryOpen(true)}
              onError={onImgError}
              className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover rounded-xl cursor-pointer"
            />

            {room.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? room.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                >
                  ‹
                </button>

                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === room.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {room.images.length}
            </div>
          </div>

          {/* Thumbnail Scroll */}
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {processedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index
                    ? "border-violet-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`${room.name}-${index}`}
                  onError={onImgError}
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
              {room.name}
            </h1>
            <div className="bg-white/95 px-3 py-2 rounded-xl">
              <p className="text-lg font-semibold text-violet-600">
                R{formatMoney(room.price)}
              </p>
              <p className="text-xs text-gray-500">per month</p>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={15} />
                {room.location.address}
              </div>

              {distance !== null && (
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                  📍 {distance.toFixed(1)} km from you
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                {avgRating.toFixed(1)}
              </div>

              {room.ownerVerified && (
                <div className="flex items-center gap-1 text-green-600">
                  <ShieldCheck size={15} />
                  Phone Verified
                </div>
              )}
            </div>

            {isOwner && (
              <ListingStats
                viewCount={room.viewCount}
                contactClickCount={room.contactClickCount}
              />
            )}

            {/* ABOUT */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-3">
                About this property
              </h2>

              <p className="text-gray-600 leading-7">
                {room.description}
              </p>

              {/* DETAILS — property facts and amenities in one grid instead
                  of two, so the same amenity never shows up twice under
                  different headings. */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">
                  Details
                </h3>

                <div className="flex flex-wrap gap-3">

                  {room.propertyType && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Home size={16} />
                      {room.propertyType}
                    </div>
                  )}

                  {room.category && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Building2 size={16} />
                      {room.category}
                    </div>
                  )}

                  {room.bedrooms !== undefined && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <BedDouble size={16} />
                      {room.bedrooms} Bedroom{room.bedrooms !== 1 && "s"}
                    </div>
                  )}

                  {room.bathrooms !== undefined && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Bath size={16} />
                      {room.bathrooms} Bathroom{room.bathrooms !== 1 && "s"}
                    </div>
                  )}

                  {room.size != null && room.size > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Ruler size={16} />
                      {room.size} m²
                    </div>
                  )}

                  {room.deposit > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      💰 Deposit R{formatMoney(room.deposit)}
                    </div>
                  )}

                  {room.leaseTerm && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      📅 {room.leaseTerm}
                    </div>
                  )}

                  {room.availableFrom && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      🗓️ Available {room.availableFrom}
                    </div>
                  )}

                  {room.parkingType && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Car size={16} />
                      {room.parkingType}
                    </div>
                  )}

                  {room.security && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <ShieldCheck size={16} />
                      {room.security}
                    </div>
                  )}

                  {room.internetSpeed && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Wifi size={16} />
                      {room.internetSpeed}
                    </div>
                  )}

                  {room.kitchenType && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <UtensilsCrossed size={16} />
                      {room.kitchenType}
                    </div>
                  )}

                  {room.noiseRule && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
                      <Volume2 size={16} />
                      {room.noiseRule}
                    </div>
                  )}

                  {typeof room.smokingAllowed === "boolean" && (
                    <div
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                        room.smokingAllowed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <CigaretteOff size={16} />
                      Smoking {room.smokingAllowed ? "Allowed" : "Not Allowed"}
                    </div>
                  )}

                  {/* Only shown when there's no more specific chip above
                      already covering the same amenity (e.g. internetSpeed
                      already implies wifi). */}
                  {room.wifi && !room.internetSpeed && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Wifi size={16} />
                      WiFi
                    </div>
                  )}

                  {room.furnished && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Sofa size={16} />
                      Furnished
                    </div>
                  )}

                  {room.parking && !room.parkingType && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Car size={16} />
                      Parking
                    </div>
                  )}

                  {room.kitchen && !room.kitchenType && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <UtensilsCrossed size={16} />
                      Kitchen
                    </div>
                  )}

                  {room.diningArea && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Lamp size={16} />
                      Dining Area
                    </div>
                  )}

                  {room.livingRoom && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Home size={16} />
                      Living Room
                    </div>
                  )}

                  {room.balcony && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Building2 size={16} />
                      Balcony
                    </div>
                  )}

                  {room.electricityIncluded && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Zap size={16} />
                      Electricity Included
                    </div>
                  )}

                  {room.waterIncluded && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Droplets size={16} />
                      Water Included
                    </div>
                  )}

                  {room.petsAllowed && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <PawPrint size={16} />
                      Pets Allowed
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* VIDEOS */}
            {room.videos && room.videos.length > 0 && (
              <div className="mt-10">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Video size={18} />
                  Videos
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.videos.map((videoUrl, index) => (
                    <video
                      key={index}
                      src={getImageUrl(videoUrl)}
                      controls
                      className="w-full rounded-xl bg-black aspect-video"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MAP */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Location</h2>

              <iframe
                className="w-full h-[250px] rounded-xl"
                loading="lazy"
                src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`}
              />

              <a
                href={directionsUrl}
                target="_blank"
                className="block mt-3 bg-violet-600 text-white text-center py-3 rounded-xl"
              >
                Get Directions
              </a>
            </div>

            <ReviewSection roomId={Number(room.id)} reviews={room.reviews} />
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block">
            <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg">

              {phoneNumber ? (
                <a
                  href={`tel:${phoneNumber}`}
                  onClick={() => recordContactClick("room", Number(room.id))}
                  className={cn(buttonVariants({ variant: "solid", tone: "violet" }), "w-full")}
                >
                  <Phone size={16} />
                  Call Owner
                </a>
              ) : (
                <Button
                  disabled
                  variant="muted"
                  className="w-full"
                  title="This listing hasn't added a contact number yet"
                >
                  <Phone size={16} />
                  No number listed
                </Button>
              )}

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  onClick={() => recordContactClick("room", Number(room.id))}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              )}

              {isOwner ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => router.push(`/rooms/${room.id}/edit`)}
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
                  Report this listing
                </button>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 border-t">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">

          {/* CALL */}
          {phoneNumber ? (
            <a
              href={`tel:${phoneNumber}`}
              onClick={() => recordContactClick("room", Number(room.id))}
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
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordContactClick("room", Number(room.id))}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11")}
            >
              <MessageCircle size={16} className="shrink-0 text-green-600" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>
          ) : (
            <Button disabled variant="muted" size="sm" className="h-11 border border-gray-200 bg-gray-50">
              <MessageCircle size={16} className="shrink-0" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </Button>
          )}

          {/* Owner sees Edit here instead of Report — reporting your own
              listing makes no sense. Delete stays desktop-sidebar-only to
              avoid a destructive action sitting in the easy-to-mistap
              bottom bar. */}
          {isOwner ? (
            <Button
              onClick={() => router.push(`/rooms/${room.id}/edit`)}
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
        targetType="room"
        targetId={Number(room.id)}
        title="Report Listing"
        reasonOptions={[
          "Fake listing",
          "Scam / fraud",
          "Wrong information",
          "Inappropriate content",
        ]}
      />

      {/* GALLERY MODAL */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 text-white text-4xl z-10"
          >
            ×
          </button>

          {selectedImage > 0 && (
            <button
              onClick={() =>
                setSelectedImage((prev) => prev - 1)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl z-10"
            >
              ‹
            </button>
          )}

          {selectedImage < room.images.length - 1 && (
            <button
              onClick={() =>
                setSelectedImage((prev) => prev + 1)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl z-10"
            >
              ›
            </button>
          )}

          <div className="h-full flex items-center justify-center p-6">
            <img
              src={processedImages[selectedImage]}
              alt={room.name}
              onError={onImgError}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw]">
            {processedImages.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`${room.name}-${index}`}
                  className={`w-20 h-16 rounded object-cover border-2 ${
                    selectedImage === index
                      ? "border-white"
                      : "border-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}