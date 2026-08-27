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
import { DetectedLocation } from "@/lib/hooks/useAutoDetectLocation";

const ROOMS_PAGE_LIMIT = 10;

interface FeaturedListingsProps {
  // Auto-detected position from useAutoDetectLocation — `area` labels the
  // "Near Me" default when no location has been manually picked, and
  // `lat`/`lng` drive that same default's actual query (see the fetch
  // effect below). A manually-picked `location`/coordinates always win.
  geo: DetectedLocation;
}

export default function FeaturedListings({
  geo,
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
    // No manual location picked yet — hold off fetching until geolocation
    // has actually settled (resolved or given up), so the first fetch is
    // already the right one instead of an unfiltered "everything" query
    // that then gets silently swapped for a filtered one. See
    // useAutoDetectLocation for why.
    const hasManualLocation = Boolean(location) || lat != null;
    if (!hasManualLocation && geo.status === "pending") return;

    const effectiveLat = lat ?? geo.lat ?? undefined;
    const effectiveLng = lng ?? geo.lng ?? undefined;

    // Rapidly toggling tags/price (or a location change landing mid-flight)
    // fires a new request per change with no debounce, and those requests
    // can resolve out of order — an earlier, now-superseded fetch can land
    // after the latest one and silently overwrite it. `cancelled` is set by
    // the cleanup function whenever a newer effect run supersedes this one,
    // so a stale response is dropped instead of clobbering the UI.
    let cancelled = false;

    const fetchRooms = async () => {
      try {
        setLoading(true);

const data = await getRooms({
  location,
   lat: effectiveLat,
  lng: effectiveLng,
  filter: priceRange,
  activeTags,
  page,
  limit: ROOMS_PAGE_LIMIT,
});

        if (cancelled) return;
        setRooms(data.data);
        setPagination(data.pagination);
        setNearby(data.nearby ?? null);
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRooms();

    return () => {
      cancelled = true;
    };
  }, [searchTrigger, location, lat, lng, geo.status, geo.lat, geo.lng, priceRange,
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
    // Same fallback as the fetch above: a manual pick wins, otherwise use
    // wherever geolocation resolved — so the per-card distance badge
    // matches what actually drove the "Near Me" results, not just the
    // (rarer) case where the user typed a suburb.
    const distanceLat = lat ?? geo.lat;
    const distanceLng = lng ?? geo.lng;
    if (!distanceLat || !distanceLng) return rooms;

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
            distanceLat,
            distanceLng,
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
  }, [rooms, lat, lng, geo.lat, geo.lng]);

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
              location || geo.area || "you",
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
