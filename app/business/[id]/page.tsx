"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import { businesses } from "@/app/data/businesses";
import BusinessReviewsSection from "@/app/components/BusinessReviewsSection";
import { Business, getBusiness } from "@/app/services/business.service";

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
  const [reason, setReason] = useState("Fake business");
  const [success, setSuccess] = useState(false);

  // ✅ IMAGE GALLERY STATE (NEW)
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // 👉 USER LOCATION
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

if (!business) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Business not found
    </div>
  );
}

  function submitReport() {
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setReportOpen(false);
    }, 1200);
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.location.lat},${business.location.lng}`;

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

  const distance = userLocation
    ? getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        business.location.lat,
        business.location.lng
      )
    : null;

  const phoneNumber = "+27723255319";
  const whatsappNumber = "+27723255319";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20I%20want%20to%20enquire%20about%20your%20services`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* ✅ HERO IMAGE GALLERY (UPDATED) */}
        <div className="bg-white rounded-2xl p-2 shadow-sm">
          <div className="relative">

            <img
              src={business.images[selectedImage]}
              alt={business.name}
              onClick={() => setGalleryOpen(true)}
              className="w-full h-[220px] sm:h-[280px] md:h-[380px] object-cover rounded-xl cursor-pointer"
            />

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
                <img
                  src={image}
                  alt={`${business.name}-${index}`}
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
              {business.category}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={15} />
                {business.location.address}
              </div>

              {distance !== null && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  📍 {distance.toFixed(1)} km from you
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                {business.rating}
              </div>

              <div className="flex items-center gap-1 text-green-600">
                <ShieldCheck size={15} />
                Verified Business
              </div>
            </div>

            {/* ABOUT */}
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">
                About this business
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {business.description}
              </p>
            </div>

            {/* LOCATION */}
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
                  src={`https://www.google.com/maps?q=${business.location.lat},${business.location.lng}&z=15&output=embed`}
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

            <BusinessReviewsSection />
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block">
            <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg">

              <a
                href={`tel:${phoneNumber}`}
                className="mt-5 w-full h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                Call Business
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                className="mt-3 w-full h-11 rounded-xl border flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>

              <button
                onClick={() => setReportOpen(true)}
                className="mt-3 w-full border border-red-500 text-red-500 py-2 rounded-xl text-sm"
              >
                Report Business
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* MODAL + MOBILE BAR (UNCHANGED LOGIC) */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">

            {success ? (
              <div className="text-center py-10">
                <p className="text-green-600 font-bold text-lg">
                  Report submitted successfully ✅
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold">Report Business</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Tell us what's wrong
                </p>

                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border p-3 mt-4 rounded-xl"
                >
                  <option>Fake business</option>
                  <option>Scam / fraud</option>
                  <option>Wrong information</option>
                  <option>Inappropriate content</option>
                </select>

                <button
                  onClick={submitReport}
                  className="w-full bg-red-600 text-white py-3 mt-4 rounded-xl"
                >
                  Submit Report
                </button>

                <button
                  onClick={() => setReportOpen(false)}
                  className="w-full mt-3 text-sm text-gray-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}