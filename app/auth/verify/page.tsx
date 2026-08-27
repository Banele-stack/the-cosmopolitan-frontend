"use client";

import {
  Mail,
  Smartphone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { getProfile, sendEmailVerification, sendPhoneVerification } from "@/features/auth/services/auth.service";

// useSearchParams() opts the page out of static rendering unless wrapped in
// Suspense — without this, `next build` fails prerendering this page.
export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next =
    searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [email, setEmail] = useState<string>();
  const [phone, setPhone] = useState<string>();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await getProfile();

      setEmail(profile.email);
      setPhone(profile.phoneNumber);
    } catch {
      // Not logged in (or the session expired) — there's nothing this
      // page can do, so send them somewhere that does rather than
      // rendering silently with no way forward.
      toast.error("Please sign in to verify your account.");
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailVerification() {
    try {
      setSending(true);

      await sendEmailVerification();

      toast.success("Verification code sent to your email.");

      router.push(
        `/auth/verify/code?method=email&next=${encodeURIComponent(
          next
        )}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification email."
      );
    } finally {
      setSending(false);
    }
  }

  async function handlePhoneVerification() {
    try {
      setSending(true);

      await sendPhoneVerification();

      toast.success("Verification code sent via SMS.");

      router.push(
        `/auth/verify/code?method=phone&next=${encodeURIComponent(
          next
        )}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification SMS."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-5">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Without this, arriving here mid-flow (e.g. via a "verify to
            continue" redirect) is a dead end short of editing the URL. */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Continue browsing
        </Link>

        <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600">
          <ShieldCheck
            className="text-white"
            size={26}
          />
        </div>

        <h1 className="mt-6 text-center text-2xl md:text-3xl font-black">
          Verify your account
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Before publishing your first listing, we need to
          verify your identity.
        </p>

        <div className="mt-8 space-y-4">
          {email && (
            <button
              disabled={sending}
              onClick={handleEmailVerification}
              className="group flex w-full items-center justify-between rounded-2xl border bg-white p-5 transition hover:border-blue-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3">
                  <Mail className="text-blue-600" />
                </div>

                <div className="text-left">
                  <h3 className="font-semibold">
                    Verify with Email
                  </h3>

                  <p className="text-sm text-gray-500">
                    {email}
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400 transition group-hover:translate-x-1" />
            </button>
          )}

          {phone && (
            <button
              disabled={sending}
              onClick={handlePhoneVerification}
              className="group flex w-full items-center justify-between rounded-2xl border bg-white p-5 transition hover:border-green-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-100 p-3">
                  <Smartphone className="text-green-600" />
                </div>

                <div className="text-left">
                  <h3 className="font-semibold">
                    Verify with SMS
                  </h3>

                  <p className="text-sm text-gray-500">
                    {phone}
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400 transition group-hover:translate-x-1" />
            </button>
          )}

          {!email && !phone && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-5 text-center">
              <p className="text-sm text-gray-600">
                We don't have an email or phone number on file to verify.
              </p>
              <button
                onClick={() => router.push(next)}
                className="mt-4 text-sm font-medium text-blue-600 hover:underline"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Verification is only required once and helps keep
          Cosmopolitan safe for everyone.
        </p>
      </div>
    </main>
  );
}