import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--foreground-muted)]">
        <FileQuestion size={24} strokeWidth={2.5} />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">
        The page you're looking for doesn't exist, or may have moved.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
