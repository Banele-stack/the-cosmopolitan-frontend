"use client";

import { useEffect, useState } from "react";
import { use, useMemo } from "react";
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
} from "lucide-react";

import ReviewSection from "@/app/components/reviews/ReviewSection";
import { getRoom } from "@/app/services/room.service";
import { Room } from "@/app/types/room";


export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [room, setRoom] = useState<Room | null>(null);
const [loading, setLoading] = useState(true);

  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("Fake listing");
  const [success, setSuccess] = useState(false);
const [selectedImage, setSelectedImage] = useState(0);
const [galleryOpen, setGalleryOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  function submitReport() {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setReportOpen(false);
    }, 1200);
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

  // 👉 fallback coords (if you haven't added them yet)
const coords = useMemo(() => {
  return {
    lat: -26.2041,
    lng: 28.0473,
  };
}, []);

  const distance = userLocation
    ? getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      coords.lat,
      coords.lng
    )
    : null;

  // 👉 CONTACT
  const phoneNumber = "+27723255319";
  const whatsappNumber = "27723255319";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20I%20am%20interested%20in%20your%20room%20listing`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading room...
    </div>
  );
}

if (!room) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Room not found
    </div>
  );
}
  return (
    <main className="min-h-screen bg-gray-50">
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
{/* GALLERY */}
<div className="bg-white rounded-2xl p-2 shadow-sm">
  <div className="relative">

    <img
      src={room.images[selectedImage]}
      alt={room.name}
      onClick={() => setGalleryOpen(true)}
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
    {room.images.map((image, index) => (
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
             <div className=" bg-white/95 px-3 py-2 rounded-xl">
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

              <div className="flex items-center gap-1 text-green-600">
                <ShieldCheck size={15} />
                Verified
              </div>
            </div>



            {/* ABOUT */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-3">
                About this property
              </h2>

              <p className="text-gray-600 leading-7">
                {room.description}
              </p>

              {/* PROPERTY DETAILS */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">
                  Property Details
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

                  {room.size > 0 && (
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
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${room.smokingAllowed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      <CigaretteOff size={16} />
                      Smoking {room.smokingAllowed ? "Allowed" : "Not Allowed"}
                    </div>
                  )}
                </div>
              </div>

              {/* AMENITIES */}
              <div className="mt-10">
                <h3 className="font-semibold text-lg mb-4">
                  Amenities
                </h3>

                <div className="flex flex-wrap gap-3">

                  {room.wifi && (
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

                  {room.parking && (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 text-sm">
                      <Car size={16} />
                      Parking
                    </div>
                  )}

                  {room.kitchen && (
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



            {/* MAP */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Location</h2>

              <iframe
                className="w-full h-[250px] rounded-xl"
                loading="lazy"
                src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
              />

              <a
                href={directionsUrl}
                target="_blank"
                className="block mt-3 bg-violet-600 text-white text-center py-3 rounded-xl"
              >
                Get Directions
              </a>
            </div>


            <ReviewSection reviews={room.reviews} />
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block">
            <div className="sticky top-6 bg-white rounded-2xl p-5 shadow-lg">

              <a
                href={`tel:${phoneNumber}`}
                className="w-full h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                Call Owner
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
                className="mt-3 w-full border border-red-500 text-red-500 py-2 rounded-xl"
              >
                Report Listing
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CTA */}
      {/* MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 z-50 border-t">
        <div className="grid grid-cols-3 gap-2">

          {/* CALL */}
          <a
            href={`tel:${phoneNumber}`}
            className="h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Phone size={16} className="shrink-0" />
            <span className="whitespace-nowrap">Call</span>
          </a>

          {/* WHATSAPP */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-xl border border-gray-300 bg-white flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle size={16} className="shrink-0 text-green-600" />
            <span className="whitespace-nowrap">WhatsApp</span>
          </a>

          {/* REPORT */}
          <button
            onClick={() => setReportOpen(true)}
            className="h-11 rounded-xl border border-red-500 text-red-500 text-sm font-medium whitespace-nowrap"
          >
            Report
          </button>

        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20 lg:hidden" />

      {/* REPORT MODAL */}
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
        src={room.images[selectedImage]}
        alt={room.name}
        className="max-h-full max-w-full object-contain"
      />
    </div>

    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw]">
      {room.images.map((image, index) => (
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