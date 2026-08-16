"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

// Framed specifically at unemployed/underemployed graduates — the app
// already has the categories for it (tutoring, bookkeeping, design,
// admin support, etc.) but nothing on the page told them this was for
// them. This does. Businesses-only (see Hero) — a graduate deciding to
// list a service is squarely on-topic there, not on Properties/Piece Jobs.
export default function GraduateCTA() {
  return (
    <div className="mt-6 sm:mt-8 max-w-3xl mx-auto rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 text-left">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <GraduationCap size={18} className="text-amber-700" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            Waiting for your dream job? Start earning locally.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2 sm:line-clamp-none">
            Sell atchar or food, open an internet café, tutor, or offer any
            local service — list it and start getting clients nearby today.
          </p>
        </div>
      </div>

      <div className="sm:shrink-0 sm:ml-2">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link
            href="/business/create"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-600 px-3 py-2 sm:px-4 text-xs font-semibold text-white hover:bg-amber-700 transition"
          >
            Start a business
            <ArrowRight size={13} className="hidden sm:inline" />
          </Link>
          <Link
            href="/gigs/create"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-2 sm:px-4 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
          >
            Post a job
          </Link>
        </div>

        {/* The distinction people actually confuse — see GraduateCTA vs
            gig/business copy elsewhere for the fuller explanation. */}
        <p className="mt-1.5 text-center text-[10px] leading-tight text-amber-700/70">
          Business = an ongoing listing · Piece Job = a one-off task
        </p>
      </div>
    </div>
  );
}
