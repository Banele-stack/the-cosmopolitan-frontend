"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export interface MediaGridItem {
  type: "image" | "video";
  url: string; // already resolved to a loadable src
}

interface MediaGridProps {
  media: MediaGridItem[];
  alt: string;
  fallbackUrl?: string;
}

// Fills its parent (the parent sets height, e.g. `relative h-60
// overflow-hidden`) with a layout that adapts to exactly how many photos/
// videos a listing has: 1 -> one full tile, 2 -> side by side, 3 -> one
// tall tile + two stacked, 4+ -> 2x2 with a "+N" overlay on the last tile.
// A fixed 2x2 grid used to render regardless of count, leaving blank
// placeholder cells for any listing with fewer than 4 images — the "empty
// containers" bug.
export default function MediaGrid({ media, alt, fallbackUrl = "/placeholder.svg" }: MediaGridProps) {
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const items = media.length ? media : [{ type: "image" as const, url: fallbackUrl }];
  const preview = items.slice(0, 4);
  const extraCount = items.length - 4;

  const tile = (item: MediaGridItem, i: number, extraClassName?: string) => {
    const isLast = i === 3 && extraCount > 0;

    return (
      <div key={i} className={`relative overflow-hidden bg-gray-100 ${extraClassName ?? ""}`}>
        {item.type === "video" ? (
          <video
            src={item.url}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={broken[i] ? fallbackUrl : item.url}
            alt={`${alt} ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setBroken((prev) => ({ ...prev, [i]: true }))}
          />
        )}

        {item.type === "video" && !isLast && (
          <div className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1">
            <Play size={10} className="fill-white text-white" />
          </div>
        )}

        {isLast && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-lg font-bold text-white">+{extraCount}</span>
          </div>
        )}
      </div>
    );
  };

  if (preview.length === 1) {
    return tile(preview[0], 0, "h-full w-full");
  }

  if (preview.length === 2) {
    return (
      <div className="grid h-full grid-cols-2 gap-1">
        {preview.map((item, i) => tile(item, i))}
      </div>
    );
  }

  if (preview.length === 3) {
    return (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-1">
        {tile(preview[0], 0, "row-span-2")}
        {tile(preview[1], 1)}
        {tile(preview[2], 2)}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-1">
      {preview.map((item, i) => tile(item, i))}
    </div>
  );
}
