import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--accent)]" aria-hidden="true" />
          <span className="text-sm text-[var(--foreground-muted)]">
            CompliancePro &mdash; Contractor, Workforce &amp; Site Safety Compliance
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--foreground-muted)]">
          <Link href="/" className="hover:text-[var(--foreground)]">
            Dashboard
          </Link>
          <Link href="/contractors" className="hover:text-[var(--foreground)]">
            Contractors
          </Link>
          <Link href="/workers" className="hover:text-[var(--foreground)]">
            Workers
          </Link>
          <Link href="/inspections" className="hover:text-[var(--foreground)]">
            Inspections
          </Link>
          <span>Aligned to MHSA, OHSA &amp; DMRE vendor requirements</span>
        </nav>
      </div>
    </footer>
  );
}
