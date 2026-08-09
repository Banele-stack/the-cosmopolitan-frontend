"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Plus, User, Home, Building2, HandHelping, Sparkles } from "lucide-react";

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

  const navItems: { label: string; value: ViewMode; icon: typeof Home }[] = [
    { label: "Properties", value: "rooms", icon: Home },
    { label: "Businesses", value: "businesses", icon: Building2 },
    { label: "Piece Jobs", value: "gigs", icon: HandHelping },
    { label: "Ask AI", value: "askAi", icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="shrink-0">
          <Image
            src="/CosmoBusinesses.png"
            alt="Cosmo"
            width={110}
            height={110}
            className="rounded-md"
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
              <Icon
                size={15}
                className={
                  value === "askAi" && !isActive(value)
                    ? "text-amber-400"
                    : ""
                }
              />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
  <Link
    href="/dashboard"
    data-tour="add-listing"
    className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
  >
    Add Service
  </Link>
)}

          <Link
            href={isLoggedIn ? "/auth/account" : "/auth"}
            data-tour={!isLoggedIn ? "add-listing" : undefined}
            className="star-burst nudge-loop float relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg transition-all hover:scale-105 active:scale-90"
          >
            {isLoggedIn ? <User size={20} /> : <Plus size={20} />}

            <span className="star star-1" />
            <span className="star star-2" />
            <span className="star star-3" />
            <span className="star star-4" />
            <span className="star star-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
