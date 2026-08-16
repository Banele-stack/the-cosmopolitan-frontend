"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Hero from "@/features/home/components/Hero";
import FeaturedListings from "@/features/home/components/FeaturedListings";
import Navbar from "@/components/layout/Navbar";
import BusinessCard from "@/features/business/components/BusinessCard";
import GigCard from "@/features/gigs/components/GigCard";
import MobileTabs from "@/components/layout/MobileTabs";
import {
  Business,
  getBusinesses,
} from "@/features/business/services/business.service";
import { Gig } from "@/features/gigs/types";
import { getGigs } from "@/features/gigs/services/gig.service";
import AskAIPanel from "@/features/ai/components/AskAIPanel";
import OnboardingTour from "@/features/home/components/OnboardingTour";
import SafetyTipsModal from "@/features/home/components/SafetyTipsModal";
import Pagination from "@/components/ui/Pagination";
import { NearbyMeta, PaginationMeta } from "@/types/pagination";

import { useBusinessSearchStore } from "@/features/business/store/business-search.store";
import { useGigSearchStore } from "@/features/gigs/store/gig-search.store";
import { useAutoDetectLocation } from "@/lib/hooks/useAutoDetectLocation";
import { formatNearbyLabel } from "@/lib/format-nearby-label";
import { formatCategoryHeading } from "@/lib/format-listing-heading";

type ViewMode = "rooms" | "businesses" | "gigs" | "askAi";

const BUSINESSES_PAGE_LIMIT = 10;
const GIGS_PAGE_LIMIT = 12;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesPagination, setBusinessesPagination] =
    useState<PaginationMeta | null>(null);
  const [businessesPage, setBusinessesPage] = useState(1);
  const [businessesNearby, setBusinessesNearby] =
    useState<NearbyMeta | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [gigsPagination, setGigsPagination] = useState<PaginationMeta | null>(
    null
  );
  const [gigsPage, setGigsPage] = useState(1);
  const [gigsNearby, setGigsNearby] = useState<NearbyMeta | null>(null);
  const [view, setView] = useState<ViewMode>("rooms");
  const [tourActive, setTourActive] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const tourWasActive = useRef(false);
  const router = useRouter();

  // Fires once, right as the onboarding tour finishes (either "Got it" or
  // "Skip") — not on mount, where tourActive also starts false but the
  // tour was never actually shown (e.g. a returning visitor).
  const handleTourActiveChange = (isActive: boolean) => {
    setTourActive(isActive);
    if (isActive) {
      tourWasActive.current = true;
    } else if (tourWasActive.current) {
      tourWasActive.current = false;
      setShowSafetyTips(true);
    }
  };

  const detectedArea = useAutoDetectLocation();

 const {
  location,
  lat,
  lng,
  categorySlug,
  subcategorySlug,
  categoryName,
  subcategoryName,
  search,
  openNow,
  deliveryAvailable,
  onlineOnly,
  nearby,
  highlyRated,
  priceRange,
  searchTrigger,
} = useBusinessSearchStore();

const {
  location: gigLocation,
  lat: gigLat,
  lng: gigLng,
  type: gigType,
  categorySlug: gigCategorySlug,
  subcategorySlug: gigSubcategorySlug,
  categoryName: gigCategoryName,
  subcategoryName: gigSubcategoryName,
  urgency: gigUrgency,
  searchTrigger: gigSearchTrigger,
} = useGigSearchStore();

useEffect(() => {
  const requestedView = new URLSearchParams(
    window.location.search
  ).get("view");

  if (
    requestedView === "rooms" ||
    requestedView === "businesses" ||
    requestedView === "gigs" ||
    requestedView === "askAi"
  ) {
    setView(requestedView);
  }
}, []);

// Keeps the URL's ?view= in sync with the current tab, so a refresh lands
// back on the same tab instead of resetting to Properties (the effect
// above is what reads it back on the next load). Skips its very first run
// — without that guard it would fire during the initial render (view is
// still the "rooms" default then, since the URL-reading effect above
// hasn't applied its setView yet) and briefly stomp a real ?view= from the
// address bar back to "rooms" before self-correcting a moment later.
const skippedInitialUrlSync = useRef(false);
useEffect(() => {
  if (!skippedInitialUrlSync.current) {
    skippedInitialUrlSync.current = true;
    return;
  }
  router.replace(`/?view=${view}`, { scroll: false });
}, [view, router]);

// Switching tabs should always land at the top of the new tab's content,
// not wherever the previous tab happened to be scrolled to. Also covers
// arriving here via the browser's Back button (e.g. from a listing detail
// page): that remounts this component fresh, `view` goes from its
// "rooms" default to whatever the URL says, and this same effect fires —
// with ScrollRestorationManager turning off the browser's own automatic
// scroll restoration, this explicit reset is what actually decides where
// the page lands, instead of racing an unpredictable native restore.
useEffect(() => {
  window.scrollTo(0, 0);
}, [view]);

// Belt-and-braces: guarantees a top-of-page landing on the very first
// mount regardless of whether the effect above happens to fire (it only
// fires on `view` *changing* — if the URL's ?view= already matches the
// default "rooms" state, setView() is a no-op and that effect never
// runs).
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // Reset to the first page whenever the search criteria change.
  // Adjusting state during render (rather than in an effect) avoids the
  // extra render pass a useEffect-based reset would trigger.
  const businessFiltersKey = JSON.stringify([
    searchTrigger,
    location,
    lat,
    lng,
    categorySlug,
    subcategorySlug,
    search,
    openNow,
    deliveryAvailable,
    onlineOnly,
    nearby,
    highlyRated,
    priceRange,
  ]);
  const [prevBusinessFiltersKey, setPrevBusinessFiltersKey] = useState(
    businessFiltersKey
  );

  if (businessFiltersKey !== prevBusinessFiltersKey) {
    setPrevBusinessFiltersKey(businessFiltersKey);
    setBusinessesPage(1);
  }

  const gigFiltersKey = JSON.stringify([
    gigSearchTrigger,
    gigLocation,
    gigLat,
    gigLng,
    gigType,
    gigCategorySlug,
    gigSubcategorySlug,
    gigUrgency,
  ]);
  const [prevGigFiltersKey, setPrevGigFiltersKey] = useState(gigFiltersKey);

  if (gigFiltersKey !== prevGigFiltersKey) {
    setPrevGigFiltersKey(gigFiltersKey);
    setGigsPage(1);
  }

useEffect(() => {
  if (view !== "businesses") return;

  const fetchBusinesses = async () => {
    try {
      setLoading(true);

const data = await getBusinesses({
  location,
   lat: lat ?? undefined,
  lng: lng ?? undefined,
  categorySlug,
  subcategorySlug,
  search,
  openNow,
  deliveryAvailable,
  onlineOnly,
  nearby,
  highlyRated,
  priceRange,
  page: businessesPage,
  limit: BUSINESSES_PAGE_LIMIT,
});

      setBusinesses(data.data);
      setBusinessesPagination(data.pagination);
      setBusinessesNearby(data.nearby ?? null);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchBusinesses();
}, [
  view,
  searchTrigger,
  location,
  lat,
  lng,
  categorySlug,
  subcategorySlug,
  search,
  openNow,
  deliveryAvailable,
  onlineOnly,
  nearby,
  highlyRated,
  priceRange,
  businessesPage,
]);

useEffect(() => {
  if (view !== "gigs") return;

  const fetchGigs = async () => {
    try {
      setLoading(true);

      const data = await getGigs({
        location: gigLocation,
        lat: gigLat ?? undefined,
        lng: gigLng ?? undefined,
        type: gigType || undefined,
        categorySlug: gigCategorySlug,
        subcategorySlug: gigSubcategorySlug,
        urgency: gigUrgency || undefined,
        page: gigsPage,
        limit: GIGS_PAGE_LIMIT,
      });

      setGigs(data.data);
      setGigsPagination(data.pagination);
      setGigsNearby(data.nearby ?? null);
    } catch (error) {
      console.error("Failed to fetch gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchGigs();
}, [
  view,
  gigSearchTrigger,
  gigLocation,
  gigLat,
  gigLng,
  gigType,
  gigCategorySlug,
  gigSubcategorySlug,
  gigUrgency,
  gigsPage,
]);

  return (
    <main
      className={`bg-gradient-to-b from-white via-gray-50 to-gray-100 ${
        view === "askAi"
          ? "flex h-screen flex-col overflow-hidden pb-14 md:pb-0"
          : "min-h-screen pb-20 md:pb-0"
      }`}
    >
      <Navbar view={view} onNavigate={setView} />
      <OnboardingTour view={view} setView={setView} onActiveChange={handleTourActiveChange} />
      <SafetyTipsModal trigger={showSafetyTips} />

      {view !== "askAi" && (
        <Hero
  view={view}
  setView={setView}
  onAskAI={() => setView("askAi")}
/>
      )}

      {view !== "askAi" && (
        <div className="max-w-6xl mx-auto px-4 py-10">

          {view === "rooms" && (
            <FeaturedListings detectedArea={detectedArea} />
          )}

          {view === "businesses" && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {formatCategoryHeading(
                    "Local Businesses",
                    "Businesses",
                    categoryName,
                    subcategoryName
                  )}
                </h1>

                <p className="text-gray-500 mt-2">
                  {formatNearbyLabel(
                    "Services",
                    location || detectedArea || "you",
                    businessesNearby,
                    businesses.length
                  )}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-500">
                  Loading businesses...
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No businesses listed here yet — be the first.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                      />
                    ))}
                  </div>

                  {businessesPagination && (
                    <Pagination
                      pagination={businessesPagination}
                      onPageChange={setBusinessesPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {view === "gigs" && (
            <div>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {formatCategoryHeading(
                      "Piece Jobs",
                      "Piece Jobs",
                      gigCategoryName,
                      gigSubcategoryName
                    )}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    {formatNearbyLabel(
                      "Piece jobs",
                      gigLocation || detectedArea || "you",
                      gigsNearby,
                      gigs.length
                    )}
                  </p>
                </div>

                <a
                  href="/gigs/create"
                  className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95 transition"
                >
                  + Post a Piece Job
                </a>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-500">
                  Loading piece jobs...
                </div>
              ) : gigs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No piece jobs posted here yet — be the first.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map((gig, index) => (
                      <GigCard key={gig.id} gig={gig} index={index} />
                    ))}
                  </div>

                  {gigsPagination && (
                    <Pagination
                      pagination={gigsPagination}
                      onPageChange={setGigsPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

        </div>
      )}

      {view === "askAi" && <AskAIPanel showNavbar={false} />}

      {view !== "askAi" && <Footer />}

      <MobileTabs
        view={view}
        setView={setView}
        tourActive={tourActive}
      />
    </main>
  );
}