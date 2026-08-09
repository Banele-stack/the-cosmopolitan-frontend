"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

interface AuthGateProps {
  // Path to send the user back to after they log in or sign up — both auth
  // pages read `?next=` and redirect there on success.
  nextPath: string;
  title: string;
  message: string;
  // Where "Continue browsing" without an account goes.
  browseHref: string;
  browseLabel?: string;
  // Gradient classes for the icon badge and primary button, so this can drop
  // into each create page's own color scheme (business = blue/indigo,
  // rooms = green/emerald, gigs = violet/purple) instead of looking bolted on.
  accent?: string;
}

// Shared "you need an account for this" screen, used by every create flow
// (business, room, gig listings) instead of letting each page grow its own
// copy of the same login-or-signup prompt. Deliberately not wrapped in a
// <main>/<Navbar> shell — callers render this inside their own page chrome,
// since business/room create pages have no navbar and gigs/create does.
export default function AuthGate({
  nextPath,
  title,
  message,
  browseHref,
  browseLabel = "← Continue browsing",
  accent = "from-violet-600 via-purple-600 to-blue-600",
}: AuthGateProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <LogIn size={24} />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-gray-900">{title}</h1>

      <p className="mt-2 text-sm text-gray-500">{message}</p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
          className={`h-12 rounded-xl bg-gradient-to-r ${accent} text-white font-semibold flex items-center justify-center active:scale-95 transition shadow-lg`}
        >
          Log in
        </Link>

        <Link
          href={`/auth/signup?next=${encodeURIComponent(nextPath)}`}
          className="h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold flex items-center justify-center active:scale-95 transition hover:border-violet-300"
        >
          Create account
        </Link>
      </div>

      <Link
        href={browseHref}
        className="mt-6 inline-block text-xs text-gray-400 hover:text-gray-600"
      >
        {browseLabel}
      </Link>
    </div>
  );
}
