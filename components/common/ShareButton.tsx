"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  // What's being shared — used as the native share sheet's title (and as
  // the toast/fallback copy), not fetched from the page itself so this
  // works identically for rooms, businesses, and gigs.
  title: string;
  text?: string;
}

// Shares the current page's URL — the actual listing link, not a
// canonicalized/slugified one, so whatever's in the address bar when this
// is clicked is exactly what gets shared.
export default function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Native share sheet where supported (most mobile browsers, some
    // desktop ones) — hands off straight to WhatsApp/SMS/etc. instead of
    // making the user paste a copied link themselves, which is the whole
    // point of a share button on a marketplace listing.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // AbortError just means the user closed the share sheet without
        // picking anything — not a failure, don't fall through to the
        // clipboard toast on top of it.
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link — copy it from the address bar instead.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this listing"
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-black active:scale-95"
    >
      {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
