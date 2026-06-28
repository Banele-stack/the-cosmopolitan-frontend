"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import RoomCard from "./RoomCard";
import { getRooms } from "@/app/services/room.service";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export default function FeaturedListings() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 👉 Get user location
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

  // 👉 Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 👉 Distance function (Haversine)
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
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // 👉 Enrich + sort rooms by distance
  const enrichedRooms = useMemo(() => {
    if (!userLocation) return rooms;

    return rooms
      .map((room) => {
        const roomCoords = {
          lat: room.location?.lat,
          lng: room.location?.lng,
        };

        // if backend doesn't have coords, skip distance
        if (!roomCoords.lat || !roomCoords.lng) {
          return { ...room, distance: null };
        }

        const distance = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          roomCoords.lat,
          roomCoords.lng
        );

        return {
          ...room,
          distance,
        };
      })
      .sort((a: any, b: any) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [userLocation, rooms]);

  // 👉 Loading state
  if (loading) {
    return (
      <section className="py-20 text-center text-gray-500">
        Loading featured rooms...
      </section>
    );
  }

  return (
    <section className="relative py-14 md:py-20">

      {/* Glow effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wider">
            Discover
          </span>

          <h2 className="text-3xl md:text-5xl font-black mt-2">
            Featured Rooms
          </h2>

          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Rooms closest to you and most relevant listings.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {enrichedRooms.map((room: any, index) => (
            <motion.div
              key={room.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}