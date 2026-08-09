import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

// Thin wrapper around lucide's Loader2, standardizing the sizes that were
// previously picked ad hoc per call site (13/14/16/18/22/24/28/32px, some
// tinted, some not) into three steps. Also replaces the two hand-rolled
// CSS-ring spinners in app/dashboard and app/auth/account — same
// animate-spin behavior, one implementation instead of three.
export default function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <span
      className="inline-flex items-center gap-2"
      role="status"
      aria-label={label ?? "Loading"}
    >
      <Loader2 size={SIZE_PX[size]} className={cn("animate-spin", className)} />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </span>
  );
}
