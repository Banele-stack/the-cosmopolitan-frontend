"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, MapPin, Wallet, KeyRound, Flag } from "lucide-react";

const STORAGE_KEY = "northstar_safety_tips_v1";

const TIPS = [
  {
    icon: MapPin,
    text: "Meet in a public place, or bring someone along, the first time you meet a buyer or seller.",
  },
  {
    icon: Wallet,
    text: "Never pay a deposit or fee before you've actually seen the room or spoken to the business.",
  },
  {
    icon: ShieldCheck,
    text: 'Look for the "Phone Verified" badge — it means we\'ve confirmed a real phone number behind the listing.',
  },
  {
    icon: KeyRound,
    text: "Never share your OTP, PIN, or password with anyone — not even someone claiming to be from Findza.",
  },
  {
    icon: Flag,
    text: "If something feels off about a listing, tap Report on it — we review every one.",
  },
];

interface SafetyTipsModalProps {
  // Parent decides *when* this becomes eligible to show (right after the
  // onboarding tour finishes) — this component only owns whether it's
  // already been dismissed before.
  trigger: boolean;
}

export default function SafetyTipsModal({ trigger }: SafetyTipsModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    let seen = true;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    if (!seen) setOpen(true);
  }, [trigger]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private-browsing edge case — worst case it shows again next visit.
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <ShieldCheck size={24} className="text-emerald-600" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Quick tips before you dive in
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Findza connects real people nearby — most of them are exactly who they say they are. A few habits keep it that way for everyone.
            </p>

            <ul className="mt-5 space-y-3.5">
              {TIPS.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                    <Icon size={14} />
                  </div>
                  <p className="text-sm leading-5 text-gray-700">{text}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={close}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              Got it, thanks
            </button>
      </div>
    </div>
  );
}
