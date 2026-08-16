"use client";

import { useEffect, useMemo, useState } from "react";
import RoomCard from "@/features/rooms/components/RoomCard";
import { getRooms } from "@/features/rooms/services/room.service";
import { useRoomSearchStore } from "@/features/rooms/store/room-search.store";
import Pagination from "@/components/ui/Pagination";
import { NearbyMeta, PaginationMeta } from "@/types/pagination";
import { formatNearbyLabel } from "@/lib/format-nearby-label";
import { formatRoomsHeading } from "@/lib/format-listing-heading";
import { ROOM_PRICE_RANGE_OPTIONS } from "@/features/rooms/constants/price-range.constants";

const ROOMS_PAGE_LIMIT = 10;

interface FeaturedListingsProps {
  // Auto-detected area name (e.g. "Cosmo City") from useAutoDetectLocation,
  // shown only as a fallback label — a manually-picked `location` always
  // wins. See useAutoDetectLocation for why the two are kept separate.
  detectedArea?: string | null;
}

export default function FeaturedListings({
  detectedArea,
}: FeaturedListingsProps) {
 const {
  location,
  lat,
  lng,
  priceRange,
  activeTags,
  searchTrigger,
} = useRoomSearchStore();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [nearby, setNearby] = useState<NearbyMeta | null>(null);

  // Reset to the first page whenever the search criteria change.
  // Adjusting state during render (rather than in an effect) avoids the
  // extra render pass a useEffect-based reset would trigger.
  const filtersKey = JSON.stringify([
    searchTrigger,
    lat,
    lng,
    priceRange,
    activeTags,
  ]);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);

  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);

const data = await getRooms({
  location,
   lat: lat ?? undefined,
  lng: lng ?? undefined,
  filter: priceRange,
  activeTags,
  page,
  limit: ROOMS_PAGE_LIMIT,
});

        setRooms(data.data);
        setPagination(data.pagination);
        setNearby(data.nearby ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchTrigger, lat, lng,priceRange,
  activeTags, page]);

  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return (
      R *
      (2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        ))
    );
  }

  const enrichedRooms = useMemo(() => {
    if (!lat || !lng) return rooms;

    return rooms
      .map((room) => {
        if (
          !room.location?.lat ||
          !room.location?.lng
        ) {
          return {
            ...room,
            distance: null,
          };
        }

        return {
          ...room,
          distance: getDistanceKm(
            lat,
            lng,
            room.location.lat,
            room.location.lng
          ),
        };
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;

        return a.distance - b.distance;
      });
  }, [rooms, lat, lng]);

  if (loading) {
    return (
      <section className="py-20 text-center text-gray-500">
        Loading featured rooms...
      </section>
    );
  }

  return (
    <section className="relative py-14 md:py-20">

      <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4">

        <div className="mb-10">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wider">
            Discover
          </span>

          <h2 className="text-3xl md:text-5xl font-black mt-2">
            {formatRoomsHeading(activeTags, priceRange, ROOM_PRICE_RANGE_OPTIONS)}
          </h2>

          <p className="text-gray-500 mt-2">
            {formatNearbyLabel(
              "Rooms",
              location || detectedArea || "you",
              nearby,
              enrichedRooms.length
            )}
          </p>
        </div>

        {enrichedRooms.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No rooms listed here yet — be the first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

              {enrichedRooms.map((room: any) => (
                <RoomCard key={room.id} room={room} />
              ))}

            </div>

            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
