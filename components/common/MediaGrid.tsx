"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export interface MediaGridItem {
  type: "image" | "video";
  url: string; // already resolved to a loadable src
}

interface MediaGridProps {
  media: MediaGridItem[];
  alt: string;
  fallbackUrl?: string;
  // Rendered instead of the generic placeholder graphic when a listing has
  // no photos/videos at all (as opposed to a photo that failed to load,
  // which still falls back to fallbackUrl). Lets callers show something
  // more specific — e.g. a category icon — for listings that were never
  // going to have a real photo, like bulk-imported directory data.
  emptyState?: ReactNode;
}

// Autoplaying every card's video the moment the grid mounts is what was
// actually causing the mobile stutter/freeze report — a page of 10-12 cards
// could mean that many videos decoding simultaneously off-screen. This
// gates loading AND playback behind IntersectionObserver: the <video> has
// no src at all until it's actually scrolled into view (so it doesn't even
// compete for bandwidth with the images that are visible), and it pauses
// again once it scrolls back out.
function LazyAutoplayVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (inView) {
      // .play() returns a promise that rejects if the browser interrupts
      // it (e.g. the tile leaves view again immediately) — swallow that,
      // it's not an error worth surfacing.
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView]);

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      className={className}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

// Fills its parent (the parent sets height, e.g. `relative h-60
// overflow-hidden`) with a layout that adapts to exactly how many photos/
// videos a listing has: 1 -> one full tile, 2 -> side by side, 3 -> one
// tall tile + two stacked, 4+ -> 2x2 with a "+N" overlay on the last tile.
// A fixed 2x2 grid used to render regardless of count, leaving blank
// placeholder cells for any listing with fewer than 4 images — the "empty
// containers" bug.
export default function MediaGrid({ media, alt, fallbackUrl = "/placeholder.svg", emptyState }: MediaGridProps) {
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  if (!media.length && emptyState) {
    return <>{emptyState}</>;
  }

  const items = media.length ? media : [{ type: "image" as const, url: fallbackUrl }];
  const preview = items.slice(0, 4);
  const extraCount = items.length - 4;

  const tile = (item: MediaGridItem, i: number, extraClassName?: string) => {
    const isLast = i === 3 && extraCount > 0;

    return (
      <div key={i} className={`relative overflow-hidden bg-gray-100 ${extraClassName ?? ""}`}>
        {item.type === "video" ? (
          <LazyAutoplayVideo
            src={item.url}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // next/image handles resizing, WebP/AVIF conversion, and
          // responsive srcset automatically — this is what actually fixes
          // "photos take too long to load on a slow connection": the phone
          // downloads a compressed image sized for this tile, not the
          // original multi-MB upload. `fill` matches the parent tile,
          // which is already `relative` + a fixed height from its grid.
          <Image
            src={broken[i] ? fallbackUrl : item.url}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
