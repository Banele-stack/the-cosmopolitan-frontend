"use client";

import { useState } from "react";
import { MapPin, Briefcase, Search } from "lucide-react";

export default function SearchBar() {
  const [location, setLocation] = useState("Cosmo City");
  const [category, setCategory] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  function handleSearch() {
    console.log({
      location,
      category,
      activeTags,
    });
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div
        className="
          bg-white/80
          backdrop-blur-xl
          border
          border-white/60
          shadow-xl
          rounded-2xl
          p-2
          md:p-4
          flex
          flex-col
          md:flex-row
          gap-2
          transition-all
          duration-500
          hover:shadow-violet-500/20
        "
      >
        {/* LOCATION */}

        <div className="relative flex-1">
          <MapPin
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-violet-500
              pointer-events-none
              z-10
            "
          />

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="
              w-full
              h-12
              md:h-14
              pl-10
              pr-4
              rounded-xl
              bg-gray-50
              border
              border-transparent
              hover:border-violet-200
              focus:border-violet-500
              focus:ring-4
              focus:ring-violet-100
              outline-none
              appearance-none
              transition-all
              cursor-pointer
              text-sm
            "
          >
            <option value="Cosmo City">Cosmo City</option>
            <option value="Ext 0">Ext 0</option>
            <option value="Ext 1">Ext 1</option>
            <option value="Ext 2">Ext 2</option>
            <option value="Ext 3">Ext 3</option>
            <option value="Randburg">Randburg</option>
            <option value="Roodepoort">Roodepoort</option>
            <option value="Fourways">Fourways</option>
          </select>
        </div>

        {/* CATEGORY */}

        <div className="relative flex-1">
          <Briefcase
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-violet-500
              pointer-events-none
              z-10
            "
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              w-full
              h-12
              md:h-14
              pl-10
              pr-4
              rounded-xl
              bg-gray-50
              border
              border-transparent
              hover:border-violet-200
              focus:border-violet-500
              focus:ring-4
              focus:ring-violet-100
              outline-none
              appearance-none
              transition-all
              cursor-pointer
              text-sm
            "
          >
            <option value="">All Categories</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Salon">Beauty Salons</option>
            <option value="Barbershop">Barbershops</option>
            <option value="Mechanic">Mechanics</option>
            <option value="Plumber">Plumbers</option>
            <option value="Electrician">Electricians</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Cleaning">Cleaning Services</option>
            <option value="Car Wash">Car Wash</option>
            <option value="Grocery">Grocery Stores</option>
          </select>
        </div>

        {/* SEARCH BUTTON */}

        <button
          onClick={handleSearch}
          className="
            h-12
            md:h-14
            w-full
            md:w-auto
            md:px-7
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            via-purple-600
            to-blue-600
            text-white
            text-sm
            font-medium
            flex
            items-center
            justify-center
            gap-2
            active:scale-95
            transition-all
            duration-300
            shadow-lg
            hover:shadow-violet-500/30
          "
        >
          <Search size={16} />
          Search Businesses
        </button>
      </div>

      {/* QUICK FILTERS */}

      <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-1">
        {[
          "Open Now",
          "Top Rated",
          "Verified",
          "Free Delivery",
          "Wheelchair Access",
          "Popular",
        ].map((tag) => {
          const isActive = activeTags.includes(tag);

          return (
            <span
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                px-3
                py-1.5
                text-[11px]
                md:text-xs
                rounded-full
                border
                cursor-pointer
                transition-all
                duration-200
                select-none
                whitespace-nowrap

                ${
                  isActive
                    ? "bg-violet-600 text-white border-violet-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                }
              `}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </div>
  );
}

