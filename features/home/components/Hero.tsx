"use client";

import SearchBar from "./SearchBar";
import BusinessSearchPanel from "@/features/business/components/BusinessSearchPanel";
import GigSearchPanel from "@/features/gigs/components/GigSearchPanel";
import GraduateCTA from "./GraduateCTA";

type ViewMode = "rooms" | "businesses" | "gigs";

interface HeroProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  onAskAI?: () => void;
}

export default function Hero({
  view,
  setView,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-10">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-flex px-4 py-2 rounded-full bg-black text-white text-xs">
          South Africa Marketplace
        </span>

        {/* Title */}
        <h1 className="mt-6 text-4xl md:text-6xl font-black">
          Find rooms & services
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
            in one place
          </span>
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Discover rooms to rent, trusted local businesses, and community
          events near you.
        </p>

        {/* Search */}
        <div className="mt-8">
          {view === "businesses" ? (
            <BusinessSearchPanel />
          ) : view === "gigs" ? (
            <GigSearchPanel />
          ) : (
            <SearchBar />
          )}
        </div>

        {/* View switching now lives in the top navbar (desktop) and the
            bottom MobileTabs bar (mobile) — kept here only once, not
            duplicated on this screen too. */}

        {/* Businesses-only — listing a service is on-topic there; Piece
            Jobs already has its own "+ Post a Piece Job" CTA, and
            Properties is about renting a room, not offering a skill. */}
        {view === "businesses" && <GraduateCTA />}
      </div>
    </section>
  );
}
