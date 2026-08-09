"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Spinner from "./spinner";

// Every button "look" found across the app, consolidated into one
// component: variant picks the shape, tone picks the color, shape picks the
// radius. See the compoundVariants below for the exact canonical color
// combos this replaces — a couple of near-duplicate gradients that only
// differed by one Tailwind shade (e.g. auth's violet-500→blue-500 vs
// admin's violet-600→blue-600) are normalized to a single shade here; the
// difference was imperceptible and this removes the drift.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 whitespace-nowrap",
  {
    variants: {
      variant: {
        gradient: "text-white shadow-lg",
        solid: "text-white",
        outline: "border bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
        "danger-outline": "border border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
        "danger-solid": "bg-red-600 text-white hover:bg-red-700",
        // Inert placeholder for an unavailable action (e.g. "no number
        // listed") — distinct from a disabled interactive button, this one
        // never had an action to disable in the first place.
        muted: "bg-gray-100 text-gray-400",
      },
      tone: {
        violet: "",
        blue: "",
        green: "",
        emerald: "",
        amber: "",
        gray: "",
      },
      shape: {
        rounded: "rounded-xl",
        pill: "rounded-full",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-sm",
        icon: "h-10 w-10 p-0 shrink-0",
      },
    },
    compoundVariants: [
      // Gradient CTAs — canonical two/three-stop brand gradients per area.
      { variant: "gradient", tone: "violet", class: "bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600" },
      { variant: "gradient", tone: "blue", class: "bg-gradient-to-r from-blue-600 to-indigo-600" },
      { variant: "gradient", tone: "green", class: "bg-gradient-to-r from-green-600 to-emerald-600" },
      // Solid feature-colored CTAs (WhatsApp/Call/submit buttons).
      { variant: "solid", tone: "violet", class: "bg-violet-600 hover:bg-violet-700" },
      { variant: "solid", tone: "blue", class: "bg-blue-600 hover:bg-blue-700" },
      { variant: "solid", tone: "green", class: "bg-green-600 hover:bg-green-700" },
      { variant: "solid", tone: "emerald", class: "bg-emerald-600 hover:bg-emerald-700" },
      { variant: "solid", tone: "amber", class: "bg-amber-600 hover:bg-amber-700" },
      // Icon-only circular buttons (carousel arrows, close/logout icons).
      { size: "icon", shape: "pill", class: "rounded-full" },
    ],
    defaultVariants: {
      variant: "solid",
      tone: "violet",
      shape: "rounded",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const LIGHT_TEXT_VARIANTS = new Set(["gradient", "solid", "danger-solid"]);

export default function Button({
  className,
  variant,
  tone,
  shape,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, tone, shape, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner
          size="sm"
          className={LIGHT_TEXT_VARIANTS.has(variant ?? "solid") ? "text-white" : "text-current"}
        />
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
