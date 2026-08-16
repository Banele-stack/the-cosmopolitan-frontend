import { Link2 } from "lucide-react";

interface SocialLinkButtonProps {
  // This listing's owner's Facebook/LinkedIn/other profile link (see
  // User.socialLink) — unlike TikTok, there's no shared placeholder, so
  // this genuinely doesn't render for owners who haven't set one.
  url?: string;
}

// Mirrors TikTokFollow's styling, but the field behind this one is
// deliberately generic (Facebook, LinkedIn, a business page, whatever the
// owner pasted at signup or in their profile) — so this uses a neutral
// link glyph and label instead of assuming a platform.
export default function SocialLinkButton({ url }: SocialLinkButtonProps) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-black"
    >
      <Link2 size={16} />
      Visit Profile
    </a>
  );
}
