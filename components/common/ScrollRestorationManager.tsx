"use client";

import { useEffect } from "react";

// Every page here fetches its content client-side after mount (rooms,
// businesses, gigs — none of it is there on first paint). The browser's
// own back/forward scroll restoration doesn't know that: it replays
// whatever scrollY it last recorded for a URL, which can land you in the
// footer of a page that hasn't rendered its cards yet, or in the middle of
// a taller version of the page from earlier in the session. That's the
// "back button dumps me at the bottom" bug — the browser's restoration and
// this app's own scroll-to-top-on-mount logic were both trying to drive,
// and whichever one won was unpredictable.
//
// Setting this to "manual" hands scroll position entirely to the app —
// every page/tab now needs its own explicit scroll-to-top on mount (see
// the home page's view-change effect and the detail pages), but that's a
// deterministic outcome instead of a race.
export default function ScrollRestorationManager() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null;
}
