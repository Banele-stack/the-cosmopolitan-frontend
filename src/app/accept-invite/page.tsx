"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * Sets the password that activates a team invite. This deliberately reuses
 * compliance-pro-api's /auth/reset-password endpoint rather than adding a
 * new one — an invited user's account already has the same one-time
 * resetTokenHash/resetTokenExpiresAt shape a forgot-password reset uses
 * (see OrganizationsService.inviteMember), and consuming that token also
 * flips the account from 'invited' to 'active'. Same API call as
 * app/reset-password/page.tsx, just different copy for the different
 * moment the user is in.
 */
function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "This invite link is invalid or has expired.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
        <p className="text-sm text-[var(--foreground-muted)]">
          This link is missing its invite token. Ask whoever invited you to send a fresh invite.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800 shadow-sm dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        <span>Your account is ready. Taking you to sign in…</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Choose a password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, a letter and a number"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {submitting ? "Setting up your account…" : "Activate my account"}
        </button>
      </div>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <ShieldCheck size={24} strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
          You&apos;ve been invited to CompliancePro
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Set a password to activate your account
        </p>
      </div>
      <Suspense fallback={null}>
        <AcceptInviteForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        Already activated?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
