"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof (window as any).gtag !== "function") return;

    (window as any).gtag("config", "G-4NEHLL13NR", {
      page_path: pathname + "?" + searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}