"use client";

import Link from "next/link";
import {
  Star,
  MapPin,
  BadgeCheck,
  Truck,
  MessageCircle,
  GraduationCap,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import MediaGrid, { MediaGridItem } from "@/components/common/MediaGrid";

// Business images are either a full URL (seeded/external) or a path
// relative to the API origin (uploaded via the create-business form) —
// only the latter needs the API URL prefixed. Same pattern as RoomCard's
// getImageUrl / the business detail page's getMediaUrl.
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.svg";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

export default function BusinessCard({
  business,
  index = 0,
}: any) {
  const isPhysical = business.businessType === "physical";

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = days[new Date().getDay()];
  const todayHours = isPhysical ? business.operatingHours?.[today] : undefined;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  let isOpen = false;

  if (todayHours && todayHours !== "Closed") {
    const [open, close] = todayHours.split(" - ");
    const openMinutes = timeToMinutes(open);
    const closeMinutes = timeToMinutes(close);

    isOpen =
      currentMinutes >= openMinutes &&
      currentMinutes <= closeMinutes;
  }

  const categoryLabel =
    business.subcategory?.name ?? business.category?.name ?? "Business";

  // Images and videos share the same preview grid — a listing's video is
  // part of "what this listing looks like" just as much as its photos, so
  // it shouldn't be hidden away on the detail page only. Videos are placed
  // after images so the grid still leads with a photo when both exist.
  const media: MediaGridItem[] = [
    ...(business.images ?? []).map((url: string) => ({ type: "image" as const, url: getImageUrl(url) })),
    ...(business.videos ?? []).map((url: string) => ({ type: "video" as const, url: getImageUrl(url) })),
  ];

  return (
      <Link href={`/business/${business.id}`}>
        {/* backdrop-blur-xl removed: it's one of the most GPU-expensive CSS
            effects, and repeating it across every card in a scrolling grid
            (10+ on this page) was a real mobile stutter cause — bg-white/95
            keeps the same near-opaque look without the per-frame blur
            compositing cost. */}
        <div className="group bg-white/95 rounded-3xl overflow-hidden border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">

          {/* MEDIA GRID — layout adapts to how many photos/videos there
              actually are, instead of always reserving 4 cells. */}
          <div className="relative h-60 overflow-hidden">
            <MediaGrid media={media} alt={business.name} />

            {/* Category */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-xs font-semibold text-violet-700 z-10">
              {categoryLabel}
            </div>

            {/* Rating */}
            <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-full flex items-center gap-1 z-10">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{business.rating}</span>
            </div>

            {/* Verified */}
            {business.ownerVerified && (
              <div className="absolute bottom-3 right-3 z-10">
                <Badge tone="green">
                  <BadgeCheck size={12} />
                  Phone Verified
                </Badge>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-5">

            <h3 className="font-bold text-lg line-clamp-1">
              {business.name}
            </h3>

            {business.credential && (
              <div className="mt-1.5 flex items-center gap-1 text-amber-700">
                <GraduationCap size={14} className="shrink-0" />
                <span className="text-xs font-medium line-clamp-1">
                  {business.credential}
                </span>
              </div>
            )}

            {isPhysical && business.location?.address && (
              <div className="flex items-center gap-1 mt-2 text-gray-500">
                <MapPin size={15} />
                <span className="text-sm">
                  {business.location.address}
                </span>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {business.description}
            </p>

            {isPhysical && business.operatingHours && (
              <div className="mt-3 text-xs">
                <span
                  className={`font-semibold ${
                    isOpen ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isOpen ? "Open now" : "Closed"}
                </span>

                <span className="text-gray-500 ml-2">
                  • Today: {todayHours}
                </span>
              </div>
            )}

            {(business.supportsDelivery || business.supportsWhatsAppOrder) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {business.supportsDelivery && (
                  <Badge tone="blue">
                    <Truck size={12} />
                    Delivery available
                  </Badge>
                )}

                {business.supportsWhatsAppOrder && (
                  <Badge tone="green">
                    <MessageCircle size={12} />
                    Order via WhatsApp
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-5 pt-4">
              <span className="text-sm text-gray-500">
                {business.reviewCount ?? 0} reviews
              </span>

              <span className="text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
                View →
              </span>
            </div>

          </div>
        </div>
      </Link>
  );
}