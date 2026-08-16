"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

export default function FormProgress({
  sections,
  accent = "from-green-500 to-emerald-600",
  containerClassName = "max-w-2xl",
  // When given, this drives the bar directly — used by forms that now show
  // one step at a time instead of one long scroll (see rooms/create and
  // business/create). Omit it to keep the old scroll-spy behavior for any
  // form that's still a single continuous page.
  activeIndex: controlledIndex,
}: {
  sections: Section[];
  accent?: string;
  containerClassName?: string;
  activeIndex?: number;
}) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;

  useEffect(() => {
    if (isControlled) return;

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = elements.indexOf(entry.target as HTMLElement);
          if (index !== -1) setScrollIndex(index);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections, isControlled]);

  const activeIndex = isControlled ? controlledIndex : scrollIndex;
  const current = sections[activeIndex];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-3">
      <div
        className={`pointer-events-auto w-full ${containerClassName} rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <div className="flex items-center gap-2">
            {/* Multi-step forms like this one have no other way out —
                without this, leaving mid-form means editing the URL. */}
            <Link
              href="/"
              aria-label="Cancel and go home"
              className="pointer-events-auto -m-1 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={14} />
            </Link>
            <span>
              Step {activeIndex + 1} of {sections.length}
            </span>
          </div>
          <span className="text-gray-700">{current?.label}</span>
        </div>

        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-300`}
            style={{
              width: `${((activeIndex + 1) / sections.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
