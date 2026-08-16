interface TikTokFollowProps {
  // This listing's owner's TikTok — the backend falls back to a shared
  // placeholder URL for owners who haven't set their own yet, so this is
  // rarely undefined, but the caller still shouldn't render if it is.
  url?: string;
}

// Lucide (the icon set used everywhere else on these pages) doesn't ship
// brand marks, so the TikTok glyph is inlined here as a single-path SVG
// instead of a package dependency — sized/colored the same way the
// lucide icons around it are (currentColor, 16px).
function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 448 512"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
    >
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  );
}

export default function TikTokFollow({ url }: TikTokFollowProps) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-black"
    >
      <TikTokIcon />
      Follow on TikTok
    </a>
  );
}
