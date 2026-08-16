import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  // "dashed" = the bordered card look (dashboard/admin empty listing
  // sections); "plain" = bare centered text, no wrapper card (used where an
  // empty state sits inside a panel that already has its own border, e.g.
  // reviews/bookings sections).
  variant?: "dashed" | "plain";
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "dashed",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        variant === "dashed" && "rounded-2xl border-2 border-dashed border-gray-200",
        className,
      )}
    >
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <p className="font-medium text-gray-500">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
