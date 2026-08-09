"use client";

import {
  verifyEmail,
  verifyPhone,
  sendEmailVerification,
  sendPhoneVerification,
} from "@/features/auth/services/auth.service";
import { motion } from "framer-motion";
import {
  Mail,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

// useSearchParams() opts the page out of static rendering unless wrapped in
// Suspense — without this, `next build` fails prerendering this page.
export default function VerifyCodePage() {
  return (
    <Suspense fallback={null}>
      <VerifyCodeForm />
    </Suspense>
  );
}

function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = searchParams.get("method") || "email";

  const next =
    searchParams.get("next") || "/dashboard";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const isEmail = method === "email";

  async function handleVerify(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      if (isEmail) {
        await verifyEmail(code);
      } else {
        await verifyPhone(code);
      }

      toast.success("Verification successful!");

      router.push(next);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);

    try {
      if (isEmail) {
        await sendEmailVerification();
      } else {
        await sendPhoneVerification();
      }

      toast.success(
        `A new ${isEmail ? "email" : "SMS"
        } verification code has been sent.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-5">

      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Without this, arriving here mid-flow is a dead end short of
            editing the URL. */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Continue browsing
        </Link>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600">

          {isEmail ? (
            <Mail
              className="text-white"
              size={30}
            />
          ) : (
            <Smartphone
              className="text-white"
              size={30}
            />
          )}

        </div>

        <h1 className="mt-6 text-center text-3xl font-black">
          Enter verification code
        </h1>

        <p className="mt-3 text-center text-gray-600">
          {isEmail
            ? "We've sent a verification code to your email."
            : "We've sent a verification code to your phone."}
        </p>

        <form
          onSubmit={handleVerify}
          className="mt-8"
        >
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            placeholder="123456"
            maxLength={6}
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center text-3xl font-bold tracking-[0.5em] outline-none transition focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading
              ? "Verifying..."
              : "Verify"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-5 w-full text-sm font-medium text-blue-600 transition hover:text-blue-800 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend verification code"}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={16} />
          Your account only needs to be verified once.
        </div>
      </motion.div>
    </main>
  );
}