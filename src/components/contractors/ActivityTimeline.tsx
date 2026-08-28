import {
  CheckCircle2,
  FileUp,
  GraduationCap,
  ClipboardCheck,
  BellRing,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { ActivityLogEntry, ActivityType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const TYPE_META: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  renewal: { icon: CheckCircle2, color: "var(--status-good-text)" },
  upload: { icon: FileUp, color: "var(--accent)" },
  induction: { icon: GraduationCap, color: "var(--accent)" },
  review: { icon: ClipboardCheck, color: "var(--foreground-muted)" },
  reminder: { icon: BellRing, color: "var(--status-warning-text)" },
  "site-assignment": { icon: MapPin, color: "var(--foreground-muted)" },
  audit: { icon: ClipboardCheck, color: "var(--foreground-muted)" },
};

export default function ActivityTimeline({ entries }: { entries: ActivityLogEntry[] }) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <ol className="relative border-l border-[var(--border)] pl-6">
      {sorted.map((entry) => {
        const meta = TYPE_META[entry.type];
        const Icon = meta.icon;
        return (
          <li key={entry.id} className="mb-6 last:mb-0">
            <span
              className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--surface)]"
              style={{ background: meta.color }}
            >
              <Icon size={9} className="text-[var(--surface)]" strokeWidth={3} />
            </span>
            <p className="text-sm text-[var(--foreground)]">{entry.description}</p>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
              {formatDate(entry.date)} &middot; {entry.actor}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
