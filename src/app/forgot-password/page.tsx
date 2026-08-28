"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      // Always show the same "check your email" state, whether or not the
      // request actually succeeded — the backend already returns the same
      // generic message either way, and doing the same here avoids leaking
      // whether the address has an account through a client-visible error.
      setSubmitting(false);
      setDone(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <KeyRound size={24} strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          We&apos;ll email you a link to choose a new one
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        {done ? (
          <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>If an account exists for that email, a reset link is on its way. Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Work email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@miningcompany.co.za"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}
