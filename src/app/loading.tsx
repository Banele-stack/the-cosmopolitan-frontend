import { Loader2 } from "lucide-react";

/**
 * Shown automatically by Next while a page's server-side data fetch is in
 * flight (every page here is a server component fetching from the API —
 * see src/lib/api.ts) — without this the visitor just sees a blank tab
 * until the fetch resolves.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
    </div>
  );
}
