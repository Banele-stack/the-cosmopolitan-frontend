"use client";

import { getOnboardingStatus, signup } from "@/features/auth/services/auth.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

// useSearchParams() opts the page out of static rendering unless wrapped in
// Suspense — without this, `next build` fails prerendering this page.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when we redirected here from a gated page (e.g. posting a gig) —
  // send them back there instead of the default onboarding/dashboard flow.
  const next = searchParams.get("next");

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Users paste links in every shape ("facebook.com/x", "www.linkedin.com/in/x",
  // "https://..."). Only add a protocol when one's missing so we don't mangle
  // an already-valid URL, and only bother once there's something to normalize.
  const normalizeSocialLink = (link: string) => {
    const trimmed = link.trim();

    if (!trimmed) return undefined;

    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const formatPhoneNumber = (number: string) => {
    let cleaned = number.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    return `+27${cleaned}`;
  };

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!firstName.trim() || !surname.trim() || !password.trim()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!email.trim() && !phoneNumber.trim()) {
    toast.error("Please provide either an email or a phone number.");
    return;
  }

  const formattedPhone = phoneNumber.trim()
    ? formatPhoneNumber(phoneNumber)
    : undefined;

  setLoading(true);

  try {
    await signup({
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim() || undefined,
      phoneNumber: formattedPhone,
      password,
      socialLink: normalizeSocialLink(socialLink),
      tiktokUrl: normalizeSocialLink(tiktokUrl),
    });

    toast.success("Account created successfully!");

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
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Signup failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5">
      {/* Background glow — used to pulse/bounce forever, which reads as
          "something's loading/wrong" to someone unfamiliar with app
          conventions rather than decoration. Static now. */}
      <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/20 via-blue-400/20 to-cyan-400/20 blur-[140px]" />
      <div className="absolute left-6 top-24 h-28 w-28 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-20 right-6 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Without this, arriving here (e.g. via a "sign in to continue"
            redirect) is a dead end short of editing the URL. */}
        <div className="text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Continue browsing
          </Link>
        </div>

        <div className="inline-flex items-center rounded-full border border-white/40 bg-white/60 px-3 py-1.5 text-[11px] text-gray-600 backdrop-blur">
          ✦ Cosmo Access
        </div>

        <h1 className="mt-5 text-2xl font-black leading-tight text-gray-900">
          Create account
          <span className="block bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            in seconds
          </span>
        </h1>

        <p className="mt-3 text-xs text-gray-500">
          Save favourites, contact owners, or list your own rooms and
          businesses on Cosmo.
        </p>

        <form
          onSubmit={handleSignup}
          className="mt-7 flex flex-col gap-3 text-left"
        >
          {/* First Name + Surname */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-400"
            />

            <input
              type="text"
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-400"
            />
          </div>

          {/* Email + phone share one requirement: at least one of them.
              Stated once, up front, instead of tagging both fields
              "(optional)" and burying the actual rule in a caption. */}
          <p className="ml-2 text-xs font-medium text-gray-600">
            Add your email, phone number, or both
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-400"
          />

          {/* Phone */}
          <div className="flex overflow-hidden rounded-full border border-white/40 bg-white/60 backdrop-blur">
            <div className="flex w-28 items-center justify-center border-r border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
              🇿🇦 +27
            </div>

            <input
              type="tel"
              placeholder="83 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              inputMode="numeric"
              autoComplete="tel-national"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-700 outline-none"
            />
          </div>

          <p className="-mt-1 ml-2 text-xs text-gray-500">
            Phone numbers may be entered with or without the leading 0.
          </p>

          {/* Social links (both optional, both separate) — kept as two
              fields rather than one shared slot because a lot of owners
              run both a Facebook presence and a TikTok one, and forcing a
              choice between them meant one always got left off. Whatever's
              set here follows the account onto every listing/room it
              creates (see ownerSocialUrl/ownerTiktokUrl on Room/Business/
              Gig), so it's worth the extra field. */}
          <p className="ml-2 text-xs text-gray-500">
            Advertise on Facebook or TikTok? Add that page's link below —
            not just your personal profile.
          </p>

          <input
            type="text"
            placeholder="Facebook or LinkedIn link (optional)"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            autoComplete="url"
            className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-400"
          />

          <input
            type="text"
            placeholder="TikTok link (optional)"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            autoComplete="url"
            className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-400"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-white/40 bg-white/60 px-4 py-3 text-sm text-gray-700 outline-none backdrop-blur transition focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-medium text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}

            <div className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition duration-700 group-hover:translate-x-full" />
          </button>
        </form>

        <p className="mt-6 text-[11px] text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-violet-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}