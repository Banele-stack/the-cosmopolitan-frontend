import type { LucideIcon } from "lucide-react";

/**
 * Every domain (documents, certifications, inspections, incidents) has its
 * own status vocabulary, but they all reduce to the same five visual tones.
 * Domain-specific mapping helpers live in `@/lib/badges` and translate a
 * concrete status (e.g. "Red-Flagged", "Reportable") into a `BadgeProps`.
 */
export type BadgeTone = "good" | "warning" | "critical" | "info" | "neutral";

const TONE_STYLES: Record<BadgeTone, { bg: string; border: string; text: string }> = {
  good: {
    bg: "var(--status-good-bg)",
    border: "var(--status-good-border)",
    text: "var(--status-good-text)",
  },
  warning: {
    bg: "var(--status-warning-bg)",
    border: "var(--status-warning-border)",
    text: "var(--status-warning-text)",
  },
  critical: {
    bg: "var(--status-critical-bg)",
    border: "var(--status-critical-border)",
    text: "var(--status-critical-text)",
  },
  info: {
    bg: "var(--status-info-bg)",
    border: "var(--status-info-border)",
    text: "var(--status-info-text)",
  },
  neutral: {
    bg: "var(--status-neutral-bg)",
    border: "var(--status-neutral-border)",
    text: "var(--status-neutral-text)",
  },
};

interface BadgeProps {
  tone: BadgeTone;
  label: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
}

export default function Badge({ tone, label, icon: Icon, size = "md" }: BadgeProps) {
  const styles = TONE_STYLES[tone];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${padding}`}
      style={{ background: styles.bg, borderColor: styles.border, color: styles.text }}
    >
      {Icon && <Icon size={size === "sm" ? 12 : 13} strokeWidth={2.5} aria-hidden="true" />}
      {label}
    </span>
  );
}
