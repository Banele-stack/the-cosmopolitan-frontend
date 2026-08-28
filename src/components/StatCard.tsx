import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "good" | "warning" | "critical";
  href?: string;
}

const TONE_STYLES: Record<
  NonNullable<StatCardProps["tone"]>,
  { iconBg: string; iconColor: string }
> = {
  default: { iconBg: "var(--accent-soft)", iconColor: "var(--accent)" },
  good: { iconBg: "var(--status-good-bg)", iconColor: "var(--status-good-text)" },
  warning: { iconBg: "var(--status-warning-bg)", iconColor: "var(--status-warning-text)" },
  critical: { iconBg: "var(--status-critical-bg)", iconColor: "var(--status-critical-text)" },
};

export default function StatCard({ label, value, icon: Icon, hint, tone = "default", href }: StatCardProps) {
  const styles = TONE_STYLES[tone];
  const content = (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--foreground-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">{hint}</p>}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: styles.iconBg }}
        >
          <Icon size={20} style={{ color: styles.iconColor }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:border-[var(--border-strong)]">
        {content}
      </Link>
    );
  }
  return content;
}
