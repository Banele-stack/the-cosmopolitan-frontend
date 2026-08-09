"use client";

import { useEffect, useState } from "react";
import { Home, Building2, HandHelping, Sparkles } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "gigs" | "askAi";

interface MobileTabsProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  onAskAI?: () => void;
  // True while the onboarding tour is running. Does two things: keeps the
  // bar pinned on screen regardless of scroll direction (the tour
  // auto-scrolls the page to bring filters into view, and this bar is the
  // only on-screen cue for which tab that scroll landed on — letting it
  // hide right then would remove the one thing confirming "you're still on
  // Businesses"), and highlights the current tab in the tour's own violet
  // accent so it reads as part of the walkthrough, not just the normal
  // faint blue "active tab" state that's easy to miss on a small screen.
  tourActive?: boolean;
}

export default function MobileTabs({
  view,
  setView,
  onAskAI,
  tourActive,
}: MobileTabsProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 20) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabClass = (tabView: ViewMode) => {
    const isActive = view === tabView;

    if (isActive && tourActive) {
      return "text-violet-700 bg-violet-100 ring-2 ring-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.45)]";
    }

    if (isActive) {
      return "text-blue-600";
    }

    return "text-gray-500 hover:text-gray-700";
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg transition-transform duration-300 ${
        visible || tourActive ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div data-tour="content-tabs" className="flex h-14 gap-1 px-1 py-1">
        <button
          onClick={() => setView("rooms")}
          className={`flex-1 flex flex-col items-center justify-center rounded-xl transition active:scale-95 ${tabClass("rooms")}`}
        >
          <Home size={18} />
          <span className="mt-0.5 text-[10px] font-medium">Properties</span>
        </button>

        <button
          onClick={() => setView("businesses")}
          className={`flex-1 flex flex-col items-center justify-center rounded-xl transition active:scale-95 ${tabClass("businesses")}`}
        >
          <Building2 size={18} />
          <span className="mt-0.5 text-[10px] font-medium text-center leading-tight">
            Local Businesses
          </span>
        </button>

        <button
          onClick={() => setView("gigs")}
          className={`flex-1 flex flex-col items-center justify-center rounded-xl transition active:scale-95 ${tabClass("gigs")}`}
        >
          <HandHelping size={18} />
          <span className="mt-0.5 text-[10px] font-medium whitespace-nowrap">Piece Jobs</span>
        </button>

        <button
  onClick={() => setView("askAi")}
  data-tour="ask-ai"
  className={`flex-1 flex flex-col items-center justify-center rounded-xl transition active:scale-95 ${tabClass("askAi")}`}
>
  <Sparkles
    size={18}
    className={view === "askAi" && tourActive ? "" : "animate-twinkle text-amber-500"}
  />
  <span className="mt-0.5 text-[10px] font-medium">
    Ask AI
  </span>
</button>
      </div>
    </div>
  );
}
