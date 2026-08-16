"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5">
      {/* Background glow — used to pulse forever, which reads as
          "something's loading/wrong" to someone unfamiliar with app
          conventions rather than decoration. Static now. */}
      <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400/20 via-violet-400/20 to-cyan-400/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg">
          <KeyRound className="text-white" size={26} />
        </div>

        <h1 className="mt-5 text-2xl font-black text-gray-900">
          Can't sign in?
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Self-service password reset isn't available yet. In the meantime:
        </p>

        <div className="mt-6 space-y-3 text-left">
          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-sm text-gray-600 backdrop-blur">
            If you signed up with <strong>both</strong> an email and a phone
            number, try logging in with the other one — either works with
            the same password.
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-sm text-gray-600 backdrop-blur">
            Otherwise, you'll need to create a new account with a different
            email or phone number for now.
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-medium text-white shadow-md transition active:scale-95"
          >
            Back to login
          </Link>

          <Link
            href="/auth/signup"
            className="rounded-full border border-white/40 bg-white/60 py-3 text-sm font-medium text-gray-700 backdrop-blur transition active:scale-95"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}
