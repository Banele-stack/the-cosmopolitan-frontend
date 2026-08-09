import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Consolidates the status pills, category chips, verified badges, and
// urgency tags found scattered across RoomCard/BusinessCard/GigCard and the
// admin dashboard — including the tone-map pattern RoomCard had already
// half-built for itself (report status: green/amber/red). `variant="soft"`
// is the borderless chip look (category, type); `variant="outline"` adds
// the border used for status pills (report status, verified badges).
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
  {
    variants: {
      tone: {
        green: "",
        emerald: "",
        amber: "",
        red: "",
        violet: "",
        blue: "",
        gray: "",
      },
      variant: {
        soft: "",
        outline: "border",
      },
    },
    compoundVariants: [
      { tone: "green", variant: "soft", class: "bg-green-50 text-green-700" },
      { tone: "green", variant: "outline", class: "bg-green-50 text-green-600 border-green-200" },
      { tone: "emerald", variant: "soft", class: "bg-emerald-100 text-emerald-700" },
      { tone: "emerald", variant: "outline", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { tone: "amber", variant: "soft", class: "bg-amber-100 text-amber-700" },
      { tone: "amber", variant: "outline", class: "bg-amber-50 text-yellow-600 border-yellow-200" },
      { tone: "red", variant: "soft", class: "bg-red-100 text-red-600" },
      { tone: "red", variant: "outline", class: "bg-red-50 text-red-600 border-red-200" },
      { tone: "violet", variant: "soft", class: "bg-violet-50 text-violet-700" },
      { tone: "violet", variant: "outline", class: "bg-violet-50 text-violet-700 border-violet-200" },
      { tone: "blue", variant: "soft", class: "bg-blue-50 text-blue-700" },
      { tone: "blue", variant: "outline", class: "bg-blue-50 text-blue-700 border-blue-200" },
      { tone: "gray", variant: "soft", class: "bg-gray-100 text-gray-700" },
      { tone: "gray", variant: "outline", class: "bg-gray-50 text-gray-600 border-gray-200" },
    ],
    defaultVariants: { tone: "gray", variant: "soft" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export default function Badge({ className, tone, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, variant, className }))}
      {...props}
    />
  );
}

export { badgeVariants };
