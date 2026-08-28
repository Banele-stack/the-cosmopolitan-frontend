"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Root error boundary — catches anything that throws while rendering a page
 * (a failed fetch that wasn't already handled, a bad render) so the visitor
 * sees this instead of Next's default unstyled crash screen. `reset()` re-
 * renders the segment that threw without a full page reload.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side rendering errors are only visible here on the client
    // otherwise — logging keeps them out of a silent void.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
        <AlertTriangle size={24} strokeWidth={2.5} />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">
        That's on us, not you. Try again, and if it keeps happening, refresh the page.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <RotateCcw size={14} />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
