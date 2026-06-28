"use client";

import SearchBar from "../search/searchBar";
import { CalendarDays } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "events";

export default function Hero({
  view,
  setView,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-10">

      {/* background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">

        {/* BADGE */}
        <span className="inline-flex px-4 py-2 rounded-full bg-black text-white text-xs">
          South Africa Marketplace
        </span>

        {/* TITLE */}
        <h1 className="mt-6 text-4xl md:text-6xl font-black">
          Find rooms & services
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
            in one place
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Discover rooms to rent, trusted local businesses, and community events near you.
        </p>

        {/* SEARCH */}
        <div className="mt-8">
          <SearchBar view={view} />
        </div>

        {/* DESKTOP TABS */}
        <div className="hidden md:flex justify-center gap-3 mt-8">

          <Tab
            label="Rooms"
            active={view === "rooms"}
            onClick={() => setView("rooms")}
          />

          <Tab
            label="Businesses"
            active={view === "businesses"}
            onClick={() => setView("businesses")}
          />

          <Tab
            label="Events"
            active={view === "events"}
            onClick={() => setView("events")}
            icon={<CalendarDays size={16} />}
          />
        </div>
      </div>
    </section>
  );
}

function Tab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition ${
        active ? "bg-black text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}