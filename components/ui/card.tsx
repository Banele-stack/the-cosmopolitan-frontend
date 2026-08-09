import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The three real card "recipes" found across the app (plus a small modal
// variant): glass = the frosted dashboard-tile look, solid = plain white
// panel (admin rows, account sections), sticky = the detail-page sidebar
// contact panel, modal = centered dialog container (ReportModal, review
// modal, onboarding tour tooltip).
const cardVariants = cva("rounded-2xl", {
  variants: {
    variant: {
      glass: "border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl",
      solid: "border border-gray-100 bg-white shadow-sm",
      sticky: "sticky top-6 bg-white shadow-lg",
      modal: "bg-white shadow-2xl",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: { variant: "solid", padding: "md" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export default function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

export { cardVariants };
