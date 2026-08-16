"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getOnboardingStatus, login } from "@/features/auth/services/auth.service";

// useSearchParams() opts the page out of static rendering unless wrapped in
// Suspense — without this, `next build` fails prerendering this page.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when we redirected here from a gated page (e.g. posting a gig) —
  // send them back there instead of the default onboarding/dashboard flow.
  const next = searchParams.get("next");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatIdentifier = (value: string) => {
  const trimmed = value.trim();

  // If it's an email, leave it unchanged
  if (trimmed.includes("@")) {
    return trimmed;
  }

  // Keep only digits
  let cleaned = trimmed.replace(/\D/g, "");

  // Remove leading 0
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // If it doesn't already start with 27, prepend it
  if (!cleaned.startsWith("27")) {
    cleaned = `27${cleaned}`;
  }

  return `+${cleaned}`;
};

async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  setError("");

  if (!identifier.trim() || !password.trim()) {
    setError("Please enter your email or phone number and password.");
    return;
  }

  setLoading(true);

  try {
    await login({
      identifier: formatIdentifier(identifier),
      password,
    });

    if (next) {
      router.push(next);
      return;
    }

    const onboarding = await getOnboardingStatus();

if (onboarding.hasListings) {
  router.push("/dashboard");
} else {
  router.push("/onboarding");
}
  } catch (err: any) {
    setError(err.message || "Login failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5">
      {/* Background glow — used to pulse/bounce forever, which reads as
          "something's loading/wrong" to someone unfamiliar with app
          conventions rather than decoration. Static now. */}
      <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400/20 via-violet-400/20 to-cyan-400/20 blur-[140px]" />
      <div className="absolute left-6 top-24 h-28 w-28 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-20 right-6 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Without this, arriving here (e.g. via a "sign in to continue"
            redirect) is a dead end short of editing the URL. */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Continue browsing
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-white/40 bg-white/60 px-3 py-1.5 text-[11px] text-gray-600 backdrop-blur">
            ✦ Cosmo Access
          </div>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
        >
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or phone number"
            autoComplete="username"
            className="rounded-full border border-white/40 bg-white/60 px-5 py-3 text-sm outline-none backdrop-blur transition focus:border-violet-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="rounded-full border border-white/40 bg-white/60 px-5 py-3 text-sm outline-none backdrop-blur transition focus:border-violet-500"
          />

          <Link
            href="/auth/forgot-password"
            className="-mt-1 text-right text-xs font-medium text-violet-600"
          >
            Forgot password?
          </Link>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-medium text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-violet-600"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}