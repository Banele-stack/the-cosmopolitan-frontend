"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, X, ChevronDown, ChevronUp } from "lucide-react";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import { useGigSearchStore } from "@/features/gigs/store/gig-search.store";
import { getBusinessCategories } from "@/features/business/services/business.service";
import { BusinessCategory } from "@/features/business/types";
import { getCategoryIcon } from "@/features/business/utils/category-icons";
import { GigUrgency } from "@/features/gigs/types";

const URGENCY_OPTIONS: { value: GigUrgency; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "flexible", label: "Flexible" },
];

// Mirrors BusinessSearchPanel's category collapse — same underlying
// category list (Events/Beauty/Food-first, see business-category.seed.ts),
// so it gets the same "just the highlights, rest behind More" treatment
// instead of the full 17-skill wall this used to render unconditionally.
const VISIBLE_CATEGORY_COUNT = 3;

export default function GigSearchPanel() {
  const {
    location,
    type,
    categorySlug,
    subcategorySlug,
    urgency,
    setLocation,
    setCoordinates,
    setType,
    setCategorySlug,
    setSubcategorySlug,
    setUrgency,
    triggerSearch,
    clearFilters,
  } = useGigSearchStore();

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

  const hasActiveFilters =
    Boolean(location) ||
    Boolean(type) ||
    Boolean(categorySlug) ||
    Boolean(subcategorySlug) ||
    Boolean(urgency);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-2 md:p-4 flex flex-col gap-3 hover:shadow-violet-500/20 transition-all duration-500">
        <div className="flex flex-col md:flex-row gap-2">
          {/* TYPE TOGGLE */}
          <div data-tour="gig-type" className="flex flex-1 rounded-xl bg-gray-50 p-1">
            {(
              [
                { value: "", label: "All" },
                { value: "need_help", label: "Need Help" },
                { value: "offering_work", label: "Offering Work" },
              ] as const
            ).map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setType(option.value)}
                className={`flex-1 h-11 md:h-12 rounded-lg text-sm font-medium transition-all ${
                  type === option.value
                    ? "bg-white shadow text-violet-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
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
            inputClassName="w-full h-11 md:h-14 pl-10 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
          />

          {/* SEARCH BUTTON */}
          <button
            onClick={triggerSearch}
            className="h-11 md:h-14 w-full md:w-auto md:px-7 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-lg hover:shadow-violet-500/30"
          >
            Search
          </button>
        </div>

        {/* URGENCY */}
        <div className="flex flex-wrap items-center gap-2">
          {URGENCY_OPTIONS.map((option) => {
            const active = urgency === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setUrgency(active ? "" : option.value)}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                {option.label}
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

        {/* BROWSE CATEGORIES */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 px-1">
            <LayoutGrid size={13} className="text-violet-500" />
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">
              Browse Skills
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar scroll-smooth py-0.5">
            {visibleCategories.map((category) => {
              const active = category.slug === categorySlug;
              const Icon = getCategoryIcon(category.slug);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setCategorySlug(
                      active ? "" : category.slug,
                      active ? "" : category.name
                    )
                  }
                  className={`flex flex-shrink-0 snap-start items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:shadow-sm"
                  }`}
                >
                  <Icon
                    size={14}
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
                className="flex flex-shrink-0 snap-start items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap text-gray-500 border border-dashed border-gray-300 hover:border-violet-300 hover:text-violet-600 transition-all"
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

          {activeCategory && activeCategory.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar scroll-smooth mt-2.5 pl-3 py-0.5 border-l-2 border-violet-200">
              {activeCategory.subcategories.map((subcategory) => {
                const active = subcategory.slug === subcategorySlug;

                return (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() =>
                      setSubcategorySlug(
                        active ? "" : subcategory.slug,
                        active ? "" : subcategory.name
                      )
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
      </div>
    </div>
  );
}
