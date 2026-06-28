import Link from "next/link";
import { Room } from "@/app/types/room";
import {
  MapPin,
  Wifi,
  Car,
  ShieldAlert,
  BedDouble,
  Bath,
  Ruler,
  Sofa,
  Zap,
  Droplets,
  PawPrint,
  Home,
  UtensilsCrossed,
  Lamp,
  Volume2,
  ShieldCheck,
  CigaretteOff,
  Building2,
} from "lucide-react";
import { useEffect } from "react";
import { getRooms } from "@/app/services/room.service";

export default function RoomCard({
  room,
}: {
  room: Room & { distance?: number };
}) {
  const reportCount = room.reportCount ?? 0;

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-ZA").format(value);

  function getReportStatus(count: number) {
    if (count === 0) {
      return {
        color: "text-green-600 bg-green-50 border-green-200",
      };
    }

    if (count <= 2) {
      return {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    }

    return {
      color: "text-red-600 bg-red-50 border-red-200",
    };
  }

  const reportStatus = getReportStatus(reportCount);

  const hasValidSize =
    typeof room.size === "number" && room.size > 0;

  useEffect(() => {
    console.log("Component mounted");

    // example: fetch data
   getRooms()
  }, []);

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">


{/* IMAGE */}
<div className="relative overflow-hidden h-60">
  {room.images.length > 1 ? (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">

      {/* Main image (top-left) */}
      <div className="relative overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Top-right */}
      <div className="relative overflow-hidden">
        <img
          src={room.images[1]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Bottom-left */}
      <div className="relative overflow-hidden">
        <img
          src={room.images[2] ?? room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Bottom-right */}
      <div className="relative overflow-hidden">
        <img
          src={room.images[3] ?? room.images[1]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {room.images.length > 4 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
            +{room.images.length - 4}
          </div>
        )}
      </div>

    </div>
  ) : (
    <img
      src={room.images[0]}
      alt={room.name}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
  )}
</div>

        {/* CONTENT */}
        <div className="p-5">

          {/* TITLE */}
          <h3 className="font-bold text-lg line-clamp-1">
            {room.name}
          </h3>

<div className="mt-3 flex items-center justify-between gap-3">
  <div>
    <p className="text-2xl font-bold text-violet-700">
      R{formatMoney(room.price)}
    </p>
    <p className="text-xs text-gray-500">
      per month
    </p>
  </div>

  <div
    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 ${reportStatus.color}`}
  >
    <ShieldAlert size={12} />
    {reportCount === 0
      ? "No reports"
      : `${reportCount} report${reportCount > 1 ? "s" : ""}`}
  </div>
</div>

          {/* LOCATION */}
          <div className="flex items-center gap-1 mt-2 text-gray-500">
            <MapPin size={15} />
            <span className="text-sm">
              {room.location.address}
            </span>
          </div>

          {/* PROPERTY TYPE */}
          <div className="mt-3 inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs font-medium">
            <Home size={13} />
            {room.propertyType}
          </div>

          {/* CORE DETAILS */}
          <div className="grid grid-cols-2 gap-2 mt-4">

            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 text-xs">
              <BedDouble size={14} />
              {room.bedrooms} Bedroom{room.bedrooms > 1 && "s"}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 text-xs">
              <Bath size={14} />
              {room.bathrooms} Bathroom
              {room.bathrooms > 1 && "s"}
            </div>

            {hasValidSize && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 text-xs">
                <Ruler size={14} />
                {room.size} m²
              </div>
            )}

            {room.parkingType && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 text-xs">
                <Building2 size={14} />
                {room.parkingType}
              </div>
            )}
          </div>

          {/* AMENITIES */}
          <div className="flex flex-wrap gap-2 mt-4">

            {room.wifi && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Wifi size={13} />
                WiFi
              </div>
            )}

            {room.internetSpeed && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Wifi size={13} />
                {room.internetSpeed}
              </div>
            )}

            {room.parking && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Car size={13} />
                Parking
              </div>
            )}

            {room.furnished && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Sofa size={13} />
                Furnished
              </div>
            )}

            {room.kitchen && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <UtensilsCrossed size={13} />
                {room.kitchenType || "Kitchen"}
              </div>
            )}

            {room.diningArea && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Lamp size={13} />
                Dining Area
              </div>
            )}

            {room.livingRoom && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Home size={13} />
                Living Room
              </div>
            )}

            {room.balcony && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Building2 size={13} />
                Balcony
              </div>
            )}

            {room.electricityIncluded && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Zap size={13} />
                Electricity
              </div>
            )}

            {room.waterIncluded && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <Droplets size={13} />
                Water
              </div>
            )}

            {room.petsAllowed && (
              <div className="flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-full text-xs">
                <PawPrint size={13} />
                Pets Allowed
              </div>
            )}
          </div>

          {/* EXTRA INFO */}
          <div className="mt-4 flex flex-wrap gap-2">

            {room.security && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full">
                <ShieldCheck size={13} />
                {room.security}
              </div>
            )}

            {room.noiseRule && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full">
                <Volume2 size={13} />
                {room.noiseRule}
              </div>
            )}

            {typeof room.smokingAllowed === "boolean" && (
              <div
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                  room.smokingAllowed
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <CigaretteOff size={13} />
                Smoking{" "}
                {room.smokingAllowed
                  ? "Allowed"
                  : "Not Allowed"}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t">

            <div>
              <p className="text-sm text-gray-500">
                {room.reviews.length} reviews
              </p>

              <p className="text-xs text-gray-400">
                Deposit: R{formatMoney(room.deposit)}
              </p>
            </div>

            <span className="text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}