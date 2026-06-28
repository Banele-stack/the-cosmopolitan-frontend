"use client";

import { useEffect, useState } from "react";
import { MapPin, Wallet, Search } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "events";

export default function SearchBar({
  view,
}: {
  view: ViewMode;
}) {
  const [location, setLocation] = useState("Cosmo City");
  const [priceRange, setPriceRange] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    setPriceRange("");
    setActiveTags([]);
  }, [view]);

  const quickFilters = {
    rooms: [
      "WiFi Included",
      "Parking",
      "Furnished",
      "Pet Friendly",
    ],
    businesses: [
      "Open Now",
      "Verified",
      "Restaurant",
      "Salon",
      "Repair",
      "Delivery",
    ],
    events: [
      "Today",
      "This Weekend",
      "Free",
      "Family",
      "Music",
      "Sports",
    ],
  };

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  function handleSearch() {
    console.log({
      type: view,
      location,
      priceRange,
      activeTags,
    });
  }

  const searchButtonText =
    view === "rooms"
      ? "Search Rooms"
      : view === "businesses"
      ? "Search Businesses"
      : "Search Events";

  const pricePlaceholder =
    view === "rooms"
      ? "Any price"
      : view === "businesses"
      ? "Any service"
      : "Any event";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-2 md:p-4 flex flex-col md:flex-row gap-2 hover:shadow-violet-500/20 transition-all duration-500">

        {/* LOCATION */}

        <div className="relative flex-1">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
          />

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-12 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none appearance-none transition-all text-sm"
          >
            <option>Cosmo City</option>
            <option>Ext 0</option>
            <option>Ext 1</option>
            <option>Ext 2</option>
            <option>Ext 3</option>
          </select>
        </div>

        {/* FILTER */}

        <div className="relative flex-1">
          <Wallet
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
          />

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full h-12 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none appearance-none transition-all text-sm"
          >
            <option value="">{pricePlaceholder}</option>

            {view === "rooms" && (
              <>
                <option value="0-2000">R0 - R2,000</option>
                <option value="2000-4000">R2,000 - R4,000</option>
                <option value="4000-6000">R4,000 - R6,000</option>
                <option value="6000-10000">R6,000 - R10,000</option>
                <option value="10000+">R10,000+</option>
              </>
            )}

            {view === "businesses" && (
              <>
                <option>Restaurants</option>
                <option>Hair Salons</option>
                <option>Car Wash</option>
                <option>Repairs</option>
                <option>Shops</option>
              </>
            )}

            {view === "events" && (
              <>
                <option>Today</option>
                <option>This Week</option>
                <option>This Weekend</option>
                <option>Free Events</option>
              </>
            )}
          </select>
        </div>

        {/* BUTTON */}

        <button
          onClick={handleSearch}
          className="h-12 md:h-14 w-full md:w-auto md:px-7 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-lg hover:shadow-violet-500/30"
        >
          <Search size={16} />
          {searchButtonText}
        </button>
      </div>

      {/* FILTER TAGS */}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {quickFilters[view].map((tag) => {
          const active = activeTags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                active
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}