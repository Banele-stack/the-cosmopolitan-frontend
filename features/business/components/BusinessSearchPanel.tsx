"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Wallet,
  LayoutGrid,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import { useBusinessSearchStore } from "@/features/business/store/business-search.store";
import { getBusinessCategories } from "@/features/business/services/business.service";
import { BusinessCategory, PriceRange } from "@/features/business/types";
import { getCategoryIcon } from "@/features/business/utils/category-icons";
import { PRICE_RANGE_OPTIONS } from "@/features/business/constants/price-range.constants";

// Categories are already ordered township/local-economy-first (see
// business-category.seed.ts), so the first slice here is also the most
// relevant one to show by default — collapsing the rest behind "More"
// keeps the panel from turning into a wall of 17 pills.
const VISIBLE_CATEGORY_COUNT = 8;

export default function BusinessSearchPanel() {
  const {
    location,
    categorySlug,
    subcategorySlug,
    search,
    openNow,
    deliveryAvailable,
    onlineOnly,
    nearby,
    highlyRated,
    priceRange,
    setLocation,
    setCoordinates,
    setCategorySlug,
    setSubcategorySlug,
    setSearch,
    toggleOpenNow,
    toggleDeliveryAvailable,
    toggleOnlineOnly,
    toggleNearby,
    toggleHighlyRated,
    setPriceRange,
    triggerSearch,
    clearFilters,
  } = useBusinessSearchStore();

  const router = useRouter();

  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    getBusinessCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  // If a category is picked from the "hidden" overflow, keep the list
  // expanded so its pill (and subcategories) stay visible and selectable.
  const isActiveCategoryHidden =
    activeCategory != null &&
    categories.findIndex((c) => c.slug === categorySlug) >=
      VISIBLE_CATEGORY_COUNT;

  const visibleCategories =
    showAllCategories || isActiveCategoryHidden
      ? categories
      : categories.slice(0, VISIBLE_CATEGORY_COUNT);

  const hiddenCategoryCount = Math.max(
    0,
    categories.length - VISIBLE_CATEGORY_COUNT,
  );

  const askAI = () => {
    const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
    router.push(`/ai/ask-ai${params}`);
  };

  const hasActiveFilters =
    Boolean(location) ||
    Boolean(categorySlug) ||
    Boolean(subcategorySlug) ||
    Boolean(search) ||
    openNow ||
    deliveryAvailable ||
    onlineOnly ||
    nearby ||
    highlyRated ||
    Boolean(priceRange);

  const filterToggles: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    { label: "Open Now", active: openNow, onClick: toggleOpenNow },
    {
      label: "Delivery Available",
      active: deliveryAvailable,
      onClick: toggleDeliveryAvailable,
    },
    { label: "Online Only", active: onlineOnly, onClick: toggleOnlineOnly },
    { label: "Nearby", active: nearby, onClick: toggleNearby },
    {
      label: "Highly Rated",
      active: highlyRated,
      onClick: toggleHighlyRated,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-2 md:p-4 flex flex-col gap-3 hover:shadow-violet-500/20 transition-all duration-500">
        <div className="flex flex-col md:flex-row gap-2">
          {/* SEARCH */}
          <div className="relative flex-[2]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  triggerSearch();
                }
              }}
              placeholder="Search businesses..."
              className="w-full h-12 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
            />
          </div>

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
            inputClassName="w-full h-12 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
          />

          {/* PRICE RANGE */}
          <div className="relative flex-1">
            <Wallet
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
            />

            <select
              value={priceRange}
              onChange={(e) =>
                setPriceRange(e.target.value as PriceRange | "")
              }
              className="w-full h-12 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none appearance-none transition-all text-sm"
            >
              <option value="">Any price</option>
              {PRICE_RANGE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={triggerSearch}
            className="h-12 md:h-14 w-full md:w-auto md:px-7 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-lg hover:shadow-violet-500/30"
          >
            <Search size={16} />
            Search
          </button>
        </div>

        {/* Alternate entry point for anyone who'd rather describe what they
            need in plain language than dig through categories — carries
            over whatever they've already typed in Search. */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={askAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-violet-600 hover:bg-violet-50 transition"
          >
            <Sparkles size={13} />
            Not sure what to search for? Ask AI
          </button>
        </div>

        {/* BROWSE CATEGORIES */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 px-1">
            <LayoutGrid size={13} className="text-violet-500" />
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">
              Browse Categories
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar scroll-smooth py-0.5">
              {visibleCategories.map((category) => {
                const active = category.slug === categorySlug;
                const Icon = getCategoryIcon(category.slug);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setCategorySlug(active ? "" : category.slug)
                    }
                    className={`flex flex-shrink-0 snap-start items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:shadow-sm"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={active ? "text-white" : "text-violet-500"}
                    />
                    {category.name}
                  </button>
                );
              })}

              {hiddenCategoryCount > 0 && !isActiveCategoryHidden && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((v) => !v)}
                  className="flex flex-shrink-0 snap-start items-center gap-1 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap text-gray-500 border border-dashed border-gray-300 hover:border-violet-300 hover:text-violet-600 transition-all"
                >
                  {showAllCategories ? (
                    <>
                      <ChevronUp size={15} />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={15} />
                      {hiddenCategoryCount} more
                    </>
                  )}
                </button>
              )}
            </div>

            {/* edge fades hint that the row scrolls, mobile only */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/95 to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/95 to-transparent md:hidden" />
          </div>

          {/* SUBCATEGORIES */}
          {activeCategory && activeCategory.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar scroll-smooth mt-2.5 pl-3 py-0.5 border-l-2 border-violet-200">
              {activeCategory.subcategories.map((subcategory) => {
                const active = subcategory.slug === subcategorySlug;

                return (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() =>
                      setSubcategorySlug(active ? "" : subcategory.slug)
                    }
                    className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      active
                        ? "bg-violet-100 text-violet-700 border border-violet-300"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-violet-200"
                    }`}
                  >
                    {subcategory.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FILTER TOGGLES */}
        <div data-tour="business-filters" className="flex flex-wrap items-center gap-2">
          {filterToggles.map((toggle) => (
            <button
              key={toggle.label}
              type="button"
              onClick={toggle.onClick}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                toggle.active
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {toggle.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-gray-500 border border-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
