"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Building2, HandHelping, Sparkles } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "gigs" | "askAi";

// Bump this if the steps change meaningfully — old visitors who already
// dismissed the tour won't see a re-run just because copy changed, but a
// genuinely new step set (a new key) reaches everyone once.
const STORAGE_KEY = "northstar_onboarding_v3";

// Same icon+label used on the real tabs (Navbar/MobileTabs), reused here as
// a small badge on every step. The spotlight ring alone doesn't say which
// tab a step belongs to — on mobile especially, the actual tab indicator is
// a tiny label far from whatever's highlighted (and can itself be scrolled
// out of view) — so the tooltip states it directly instead of assuming the
// user notices.
const SECTION: Record<ViewMode, { label: string; icon: typeof Home }> = {
  rooms: { label: "Properties", icon: Home },
  businesses: { label: "Businesses", icon: Building2 },
  gigs: { label: "Piece Jobs", icon: HandHelping },
  askAi: { label: "Ask AI", icon: Sparkles },
};

interface Step {
  target: string; // matches a data-tour="..." attribute
  // Which top-level tab the step needs to be showing. Omit when the
  // target is visible regardless of tab (e.g. the Navbar's + button) — the
  // section badge then falls back to whatever tab is currently active.
  view?: ViewMode;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    target: '[data-tour="content-tabs"]',
    view: "rooms",
    title: "Start here",
    body: "Switch between Properties, Businesses, and Piece Jobs any time — this is how you browse.",
  },
  {
    target: '[data-tour="room-filters"]',
    view: "rooms",
    title: "Find a place to rent",
    body: "Search by area and price up top, or tap a quick filter like WiFi, Parking, or Pet Friendly to narrow it down.",
  },
  {
    target: '[data-tour="business-filters"]',
    view: "businesses",
    title: "Browse local businesses",
    body: "Filter by category and price, or toggle Open Now, Delivery, or Nearby to find exactly what you need.",
  },
  {
    target: '[data-tour="gig-type"]',
    view: "gigs",
    title: "Need it done, or doing it?",
    body: "Post a Piece Job here for a quick, one-off task. Got an ongoing trade or service instead? List it as a Business from the + button up top.",
  },
  {
    target: '[data-tour="add-listing"]',
    title: "List your own",
    body: "Tap here to add your business, room, or piece job to Cosmopolitan.",
  },
  {
    target: '[data-tour="ai-suggestions"]',
    view: "askAi",
    title: "Or just ask",
    body: 'Not sure where to start? Type something like "Find a 2-bedroom flat in Soweto under R5000" and let the AI search for you.',
  },
];

const MARGIN = 10; // gap between the spotlighted element and its ring
const GAP = 12; // gap between the ring and the tooltip card
const EDGE = 16; // minimum gap kept between the tooltip and the viewport edge

// A data-tour value can match more than one element at once (a desktop
// Navbar row and a mobile bottom-tab row both exist in the DOM — only one
// is ever actually laid out). This picks whichever one the viewport is
// currently showing.
function findVisibleTarget(selector: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(selector);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

interface OnboardingTourProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  // Lets the page keep chrome (like the mobile bottom tab bar, which
  // normally hides itself on scroll-down) pinned visible for as long as
  // the tour is running — see the callsite in app/page.tsx.
  onActiveChange?: (active: boolean) => void;
}

export default function OnboardingTour({ view, setView, onActiveChange }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const finish = useCallback(() => {
    setActive(false);
    // The tour's last step leaves the app on Ask AI — land back on
    // Properties instead, since that's the actual home tab, not wherever
    // the walkthrough happened to end.
    setView("rooms");
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage can throw in private-browsing edge cases — not
      // worth failing the tour over, it'll just show again next visit.
    }
  }, [setView]);

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  // Kick off on first visit only.
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen) return;

    // Give the page a beat to finish its first layout pass before we
    // start measuring elements against it.
    const timer = setTimeout(() => {
      setStepIndex(0);
      setActive(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Each step can require a specific tab — switch to it as soon as the
  // step becomes current. Deliberately excludes `view` from the deps: this
  // should only fire when the TOUR advances, not fight a user who taps a
  // different tab themselves mid-tour.
  useEffect(() => {
    if (!active) return;
    const wanted = STEPS[stepIndex].view;
    if (wanted && wanted !== view) {
      setView(wanted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  // Track the current step's target position, recomputing on
  // resize/scroll and whenever the step changes.
  useEffect(() => {
    if (!active) return;

    const step = STEPS[stepIndex];
    let raf = 0;
    let hasScrolledIntoView = false;

    const measure = () => {
      const el = findVisibleTarget(step.target);

      if (!el) {
        // Target isn't on screen yet (e.g. the tab we just switched to is
        // still rendering) — try again shortly rather than leaving the
        // tour stuck with no spotlight.
        setRect(null);
        return;
      }

      // Only the first successful measurement per step scrolls — once
      // scrolled, subsequent recomputes (from the scroll listener below,
      // firing throughout that very scroll) just track the moving rect.
      if (!hasScrolledIntoView) {
        hasScrolledIntoView = true;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setRect(el.getBoundingClientRect());
    };

    measure();

    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);

    const missingRetry = setTimeout(measure, 400);

    // If a target genuinely never shows up (bad selector, element removed,
    // whatever), don't leave the tour stuck dimming the whole screen with
    // nowhere to click — move on after giving it a real chance to appear.
    const giveUp = setTimeout(() => {
      const found = findVisibleTarget(step.target);
      if (!found) {
        setStepIndex((i) =>
          i >= STEPS.length - 1 ? i : i + 1
        );
        if (stepIndex >= STEPS.length - 1) finish();
      }
    }, 1500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(missingRetry);
      clearTimeout(giveUp);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [active, stepIndex, finish]);

  // Escape skips the whole tour.
  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  if (!active) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const section = SECTION[step.view ?? view];

  const next = () => {
    if (isLast) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  // Position the tooltip below the target if there's room, else above it.
  // Horizontally centered on the target but clamped to stay on screen —
  // cardWidth itself is clamped too, so this never overflows a narrow
  // phone screen (this app is mobile-first; a fixed 300px card would
  // blow past a 320px-wide viewport once margins are added).
  //
  // This static positioning (including the "flip above" transform) lives
  // on a plain, non-animated wrapper — NOT on the motion.div below. A
  // motion component needs to own the `transform` CSS property itself to
  // layer its own animated x/y/scale; handing it a literal `transform` via
  // `style` fights that and leaves the animation stuck mid-flight.
  let wrapperStyle: CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: typeof window === "undefined" ? 300 : Math.min(300, window.innerWidth - EDGE * 2),
  };

  if (rect) {
    const cardWidth = Math.min(300, window.innerWidth - EDGE * 2);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < 200 && rect.top > 200;

    const top = placeAbove
      ? Math.max(EDGE, rect.top - GAP)
      : Math.min(window.innerHeight - EDGE, rect.bottom + GAP);

    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - cardWidth - EDGE));

    wrapperStyle = {
      position: "fixed",
      top,
      left,
      width: cardWidth,
      transform: placeAbove ? "translateY(-100%)" : "none",
    };
  }

  return (
    // pointer-events-auto (not -none) on purpose: this overlay — including
    // the bright spotlighted cut-out, which sits visually on top of the
    // real element underneath — absorbs taps instead of letting them leak
    // through to whatever's highlighted. Without this, a stray tap on a
    // filter chip mid-tour would silently toggle a real filter, which is a
    // confusing thing to have happen while you're just reading. Tapping
    // anywhere out here also advances the tour, a common mobile pattern
    // (think Instagram stories) — the card itself stops that click from
    // double-firing via stopPropagation below.
    <div className="fixed inset-0 z-[200]" onClick={next}>
      {/* Dimmed backdrop with a cut-out ring around the target — a giant
          box-shadow on the ring itself is what creates the "spotlight"
          without needing an SVG mask. */}
      <AnimatePresence>
        {rect && (
          <motion.div
            key={`${stepIndex}-ring`}
            initial={false}
            animate={{
              top: rect.top - MARGIN,
              left: rect.left - MARGIN,
              width: rect.width + MARGIN * 2,
              height: rect.height + MARGIN * 2,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed rounded-2xl"
            style={{
              // A single box-shadow doing two jobs: a huge spread dims
              // everything outside this rect (the "spotlight" cutout),
              // and a tight second shadow draws the ring around it — an
              // inline style clobbers Tailwind's ring-* box-shadow classes
              // entirely, so both have to live in this one declaration.
              boxShadow:
                "0 0 0 9999px rgba(10,10,15,0.65), 0 0 0 2px rgba(255,255,255,0.85)",
            }}
          />
        )}
      </AnimatePresence>

      {!rect && (
        <div
          className="fixed inset-0"
          style={{ background: "rgba(10,10,15,0.65)" }}
        />
      )}

      <div style={wrapperStyle}>
        {/* Plain AnimatePresence (not mode="wait"): the old card's exit and
            the new card's enter run concurrently rather than sequenced.
            mode="wait" holds the outgoing element mounted until its exit
            animation finishes — on a throttled/backgrounded tab (or just a
            slow device) that animation can stall, which would leave the
            *old* step's text on screen indefinitely while state has moved
            on. A concurrent crossfade has no such dependency. */}
        <AnimatePresence>
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto rounded-2xl bg-white p-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600">
                <section.icon size={11} />
                {section.label}
              </div>
              <button
                onClick={finish}
                aria-label="Skip tour"
                className="text-gray-300 hover:text-gray-500 transition -mt-1 -mr-1"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="mt-2 text-base font-bold text-gray-900">
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{step.body}</p>

            <div className="mt-4 flex items-center justify-between">
              {/* Dots instead of "X of Y" — reads at a glance, doesn't
                  compete with the section badge for the same "here's where
                  you are" job. */}
              <div className="flex items-center gap-1">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIndex
                        ? "w-4 bg-violet-600"
                        : i < stepIndex
                        ? "w-1.5 bg-violet-300"
                        : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={finish}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 transition"
                >
                  Skip
                </button>

                <button
                  onClick={next}
                  className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95 transition"
                >
                  {isLast ? "Got it" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
