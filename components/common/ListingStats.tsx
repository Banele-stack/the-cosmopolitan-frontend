"use client";

import { Eye, MessageCircle } from "lucide-react";

interface ListingStatsProps {
  viewCount?: number;
  contactClickCount?: number;
}

// Shown only to a listing's own owner (see the isOwner checks on each
// detail page) — a LinkedIn-style "N people viewed this" readout so an
// owner can tell whether their listing is getting any attention. Kept to
// two numbers, no trend/chart — see the "Simple counter" scope decision.
export default function ListingStats({
  viewCount = 0,
  contactClickCount = 0,
}: ListingStatsProps) {
  return (
    <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-violet-900">
      <span className="flex items-center gap-1.5">
        <Eye size={15} className="text-violet-500 shrink-0" />
        <strong>{viewCount}</strong> view{viewCount === 1 ? "" : "s"}
      </span>

      <span className="flex items-center gap-1.5">
        <MessageCircle size={15} className="text-violet-500 shrink-0" />
        <strong>{contactClickCount}</strong> contact click
        {contactClickCount === 1 ? "" : "s"}
      </span>

      <span className="sm:ml-auto text-[11px] text-violet-400">
        Only visible to you
      </span>
    </div>
  );
}
