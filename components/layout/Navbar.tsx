"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Plus, User, Home, Building2, HandHelping } from "lucide-react";
import AIOrb from "@/components/common/AIOrb";

type ViewMode = "rooms" | "businesses" | "gigs" | "askAi";

interface NavbarProps {
  view?: ViewMode;
  onNavigate?: (v: ViewMode) => void;
}

export default function Navbar({ view, onNavigate }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const isActive = (v: ViewMode) =>
    view ? view === v : v === "askAi" && pathname?.startsWith("/ai/ask-ai");

  const goTo = (v: ViewMode) => {
    if (onNavigate) {
      onNavigate(v);
      return;
    }

    router.push(`/?view=${v}`);
  };

  // icon is omitted for "askAi" — that tab renders the animated AIOrb
  // instead of a static lucide icon (see the map below).
  const navItems: { label: string; value: ViewMode; icon?: typeof Home }[] = [
    { label: "Businesses", value: "businesses", icon: Building2 },
    { label: "Properties", value: "rooms", icon: Home },
    { label: "Piece Jobs", value: "gigs", icon: HandHelping },
    // Was "Ask AI" — "AI" is comfortable shorthand for us, but it can read
    // as intimidating or meaningless jargon to someone who's never
    // encountered the term. "Just Ask" describes the action instead of
    // naming the technology, and still fits the tab bar's tight width.
    { label: "Just Ask", value: "askAi" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      {/* px-3/gap-2 on mobile, widening at sm — at the full desktop sizing,
          the logo (110px) plus Add Service + Account add up to more than a
          375px phone fits. Measured against the actual rendered widths,
          not guessed. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/FindzaLogo.png"
            alt="Findza"
            width={110}
            height={44}
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <div data-tour="content-tabs" className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => goTo(value)}
              data-tour={value === "askAi" ? "ask-ai" : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(value)
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {Icon ? <Icon size={15} /> : <AIOrb size={15} />}
              {label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isLoggedIn && (
  <Link
    href="/dashboard"
    data-tour="add-listing"
    aria-label="Add Service"
    // Full label at sm+; icon-only on a phone-width screen — with the
    // logo and the (deliberately always-labelled, see below) Account
    // button both in this same row, there isn't room for two full text
    // buttons on a real 375px phone.
    className="flex h-9 sm:h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 sm:px-4"
  >
    <Plus size={16} className="sm:hidden" />
    <span className="hidden sm:inline">Add Service</span>
  </Link>
)}

          {/* Used to be an unlabeled icon (plus a permanent sparkle/nudge
              animation loop) — the only way to sign up or reach your
              account, with no word anywhere saying what it does. A visible
              label matters more here than almost anywhere else in the app
              — unlike the buttons above, this one keeps its text at every
              width rather than collapsing to icon-only on mobile. */}
          <Link
            href={isLoggedIn ? "/auth/account" : "/auth"}
            data-tour={!isLoggedIn ? "add-listing" : undefined}
            className="flex h-9 sm:h-11 shrink-0 items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 pl-2.5 pr-3 sm:pl-3 sm:pr-4 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-90"
          >
            {isLoggedIn ? <User size={15} className="shrink-0" /> : <Plus size={15} className="shrink-0" />}
            {isLoggedIn ? "Account" : "Sign Up"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
