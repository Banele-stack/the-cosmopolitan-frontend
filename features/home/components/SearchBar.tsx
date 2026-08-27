"use client";

import { Wallet, Search, X } from "lucide-react";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import { useRoomSearchStore } from "@/features/rooms/store/room-search.store";
import { quickFilters } from "@/features/home/constants/quick-filters.constants";
import { ROOM_PRICE_RANGE_OPTIONS } from "@/features/rooms/constants/price-range.constants";

export default function SearchBar() {
  const {
    location,
    priceRange,
    activeTags,
    setLocation,
    setCoordinates,
    setPriceRange,
    toggleTag,
    triggerSearch,
    clearFilters,
  } = useRoomSearchStore();

  const hasActiveFilters =
    Boolean(location) ||
    Boolean(priceRange) ||
    activeTags.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-2 md:p-4 flex flex-col md:flex-row gap-2 hover:shadow-violet-500/20 transition-all duration-500">

        {/* LOCATION */}

        <AddressAutocomplete
          className="flex-1"
          value={location}
          onInputChange={setLocation}
          onSelect={(result: GeocodeResult) => {
            setLocation(result.area || result.address);
            setCoordinates(result.lat, result.lng);
          }}
          placeholder="📍 Near Me — or search a suburb"
          inputClassName="w-full h-11 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
        />

        {/* FILTER */}

        <div className="relative flex-1">
          <Wallet
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
          />

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full h-11 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none appearance-none transition-all text-sm"
          >
            <option value="">
              Any price
            </option>

            {ROOM_PRICE_RANGE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH */}

        <button
          onClick={triggerSearch}
          className="h-11 md:h-14 w-full md:w-auto md:px-7 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-lg hover:shadow-violet-500/30"
        >
          <Search size={15} />
          Search Rooms
        </button>
      </div>

      {/* QUICK FILTERS */}

      <div
        data-tour="room-filters"
        className="flex flex-wrap justify-center items-center gap-2 mt-4"
      >
        {quickFilters.rooms.map((tag) => {
          const active = activeTags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs transition ${
                active
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {tag}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs text-gray-500 border border-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
