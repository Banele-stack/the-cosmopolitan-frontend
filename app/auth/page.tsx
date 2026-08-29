"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5">

      {/* Background glow — used to pulse/bounce forever. Constant motion on
          the very first screen a new user sees reads as "something's
          loading/wrong" rather than decoration, especially to someone who
          isn't already used to app conventions. Static now. */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-violet-400/20 via-blue-400/20 to-cyan-400/20 blur-[140px] rounded-full" />
      <div className="absolute top-20 left-6 w-28 h-28 bg-violet-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-16 right-6 w-36 h-36 bg-blue-300/20 rounded-full blur-3xl" />

      {/* content */}
      <div className="relative z-10 text-center max-w-sm">

        {/* back to browsing, so this isn't a dead end for people who
            aren't ready to sign in */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Continue browsing
        </Link>

        {/* title (smaller for mobile) */}
        <h1 className="mt-5 text-2xl font-black text-gray-900 leading-tight">
          Your Findza
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
            account
          </span>
        </h1>

        {/* subtitle */}
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          Save rooms and businesses you like, contact owners, or list your
          own — all in one account.
        </p>

        {/* buttons */}
        <div className="mt-7 flex flex-col gap-3">

          {/* login */}
          <Link
            href="/auth/login"
            className="group relative overflow-hidden rounded-full py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-blue-500 shadow-md transition active:scale-95"
          >
            Login

            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition duration-700 bg-white/20 skew-x-12" />
          </Link>

          {/* signup */}
          <Link
            href="/auth/signup"
            className="rounded-full py-3 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur border border-white/40 transition active:scale-95"
          >
            Create account
          </Link>

        </div>

        {/* footer */}
        <div className="mt-6 text-[11px] text-gray-400">
          Fast • Simple • Local
        </div>

      </div>
    </div>
  );
}