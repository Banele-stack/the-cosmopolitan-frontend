"use client";

import { useState } from "react";
import { HelpCircle, X, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Fixed site-wide contact point for reaching the admin who reviews
// reports/reviews — not a per-listing owner contact. Rendered once in the
// root layout so it's reachable from every page (create forms, listing
// details, dashboard, etc. all use different header layouts, so a nav link
// would've missed some of them). Kept anonymous in the UI copy on purpose —
// the number behind it belongs to a real person, but the widget speaks for
// "support", not for them by name.
const ADMIN_PHONE = "+27723255319";
const WHATSAPP_LINK = `https://wa.me/${ADMIN_PHONE.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
  "Hi, I need help with The Cosmopolitan."
)}`;

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-6 md:right-6">
      {open && (
          <div
            className="absolute bottom-16 right-0 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">Need help?</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Reach our support team directly — questions, issues, anything.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <a
                href={`tel:${ADMIN_PHONE}`}
                className={cn(buttonVariants({ variant: "solid", tone: "violet" }), "w-full")}
              >
                <Phone size={16} />
                Call {ADMIN_PHONE}
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                <MessageCircle size={16} className="text-green-600" />
                WhatsApp
              </a>
            </div>
          </div>
        )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg active:scale-95 transition-transform"
        aria-label="Help"
      >
        {open ? <X size={22} /> : <HelpCircle size={22} />}
      </button>
    </div>
  );
}
