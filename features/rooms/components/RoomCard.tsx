"use client";

import Link from "next/link";
import { Room } from "@/features/rooms/types";
import Badge from "@/components/ui/badge";
import MediaGrid, { MediaGridItem } from "@/components/common/MediaGrid";
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

// Room images are either a full URL (seeded/external) or a path relative
// to the API origin (uploaded via the create-room form) — only the
// latter needs the API URL prefixed.
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.svg";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

export default function RoomCard({
  room,
}: {
  room: Room & { distance?: number };
}) {
  const reportCount = room.reportCount ?? 0;

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-ZA").format(value);

  function getReportStatus(count: number): { tone: "green" | "amber" | "red" } {
    if (count === 0) return { tone: "green" };
    if (count <= 2) return { tone: "amber" };
    return { tone: "red" };
  }

  const reportStatus = getReportStatus(reportCount);

  const hasValidSize =
    typeof room.size === "number" && room.size > 0;

  // A single, de-duplicated list of facts — avoids showing both "WiFi" and
  // "Standard WiFi" (etc.) as separate chips for the same amenity, and caps
  // how much a first glance at the card has to scan.
  type Chip = { key: string; icon: typeof BedDouble; label: string; tone?: "green" | "red" };

  const chips: Chip[] = [
    { key: "bed", icon: BedDouble, label: `${room.bedrooms} Bedroom${room.bedrooms > 1 ? "s" : ""}` },
    { key: "bath", icon: Bath, label: `${room.bathrooms} Bathroom${room.bathrooms > 1 ? "s" : ""}` },
  ];

  if (hasValidSize) chips.push({ key: "size", icon: Ruler, label: `${room.size} m²` });

  if (room.internetSpeed) chips.push({ key: "wifi", icon: Wifi, label: room.internetSpeed });
  else if (room.wifi) chips.push({ key: "wifi", icon: Wifi, label: "WiFi" });

  if (room.parkingType) chips.push({ key: "parking", icon: Car, label: room.parkingType });
  else if (room.parking) chips.push({ key: "parking", icon: Car, label: "Parking" });

  if (room.furnished) chips.push({ key: "furnished", icon: Sofa, label: "Furnished" });

  if (room.kitchenType) chips.push({ key: "kitchen", icon: UtensilsCrossed, label: room.kitchenType });
  else if (room.kitchen) chips.push({ key: "kitchen", icon: UtensilsCrossed, label: "Kitchen" });

  if (room.diningArea) chips.push({ key: "dining", icon: Lamp, label: "Dining Area" });
  if (room.livingRoom) chips.push({ key: "living", icon: Home, label: "Living Room" });
  if (room.balcony) chips.push({ key: "balcony", icon: Building2, label: "Balcony" });
  if (room.electricityIncluded) chips.push({ key: "electricity", icon: Zap, label: "Electricity" });
  if (room.waterIncluded) chips.push({ key: "water", icon: Droplets, label: "Water" });
  if (room.petsAllowed) chips.push({ key: "pets", icon: PawPrint, label: "Pets Allowed" });
  if (room.security) chips.push({ key: "security", icon: ShieldCheck, label: room.security });
  if (room.noiseRule) chips.push({ key: "noise", icon: Volume2, label: room.noiseRule });

  if (typeof room.smokingAllowed === "boolean") {
    chips.push({
      key: "smoking",
      icon: CigaretteOff,
      label: room.smokingAllowed ? "Smoking Allowed" : "No Smoking",
      tone: room.smokingAllowed ? "green" : "red",
    });
  }

  const VISIBLE_CHIPS = 6;
  const visibleChips = chips.slice(0, VISIBLE_CHIPS);
  const hiddenChipCount = chips.length - visibleChips.length;

  // Images and videos share the same preview grid — a listing's video is
  // part of "what this listing looks like" just as much as its photos, so
  // it shouldn't be hidden away on the detail page only. Videos are placed
  // after images so the grid still leads with a photo when both exist.
  const media: MediaGridItem[] = [
    ...room.images.map((url) => ({ type: "image" as const, url: getImageUrl(url) })),
    ...(room.videos ?? []).map((url) => ({ type: "video" as const, url: getImageUrl(url) })),
  ];

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">

{/* MEDIA GRID — layout adapts to how many photos/videos there
    actually are, instead of always reserving 4 cells. */}
<div className="relative overflow-hidden h-60">
  <MediaGrid media={media} alt={room.name} />
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

  <Badge tone={reportStatus.tone} variant="outline">
    <ShieldAlert size={12} />
    {reportCount === 0
      ? "No reports"
      : `${reportCount} report${reportCount > 1 ? "s" : ""}`}
  </Badge>
</div>

          {/* LOCATION */}
          <div className="flex items-center gap-1 mt-2 text-gray-500">
            <MapPin size={15} />
            <span className="text-sm">
              {room.location.address}
            </span>
          </div>

          {/* PROPERTY TYPE */}
          <div className="mt-3">
            <Badge tone="violet">
              <Home size={13} />
              {room.propertyType}
            </Badge>
          </div>

          {/* DETAILS — one de-duplicated row instead of three overlapping ones */}
          <div className="flex flex-wrap gap-2 mt-4">
            {visibleChips.map((chip) => (
              <Badge key={chip.key} tone={chip.tone ?? "gray"}>
                <chip.icon size={13} />
                {chip.label}
              </Badge>
            ))}

            {hiddenChipCount > 0 && (
              <div className="flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-400">
                +{hiddenChipCount} more
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t">

            <div>
              <p className="text-sm text-gray-500">
                {room.reviews?.length ?? 0} reviews
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