import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)]">
        <Icon size={22} className="text-[var(--foreground-muted)]" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-[var(--foreground-muted)]">{description}</p>
      )}
    </div>
  );
}
