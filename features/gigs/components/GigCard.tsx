"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, BadgeCheck, Clock } from "lucide-react";
import { Gig } from "@/features/gigs/types";
import { getCategoryIcon } from "@/features/business/utils/category-icons";
import Badge, { type BadgeProps } from "@/components/ui/badge";

const URGENCY_LABEL: Record<Gig["urgency"], string> = {
  today: "Today",
  this_week: "This week",
  flexible: "Flexible",
};

const URGENCY_TONE: Record<Gig["urgency"], BadgeProps["tone"]> = {
  today: "red",
  this_week: "amber",
  flexible: "gray",
};

function formatPrice(gig: Gig): string {
  if (gig.priceType === "negotiable" || gig.price == null) return "Negotiable";

  const amount = `R${new Intl.NumberFormat("en-ZA").format(gig.price)}`;
  return gig.priceType === "hourly" ? `${amount}/hr` : amount;
}

export default function GigCard({
  gig,
  index = 0,
}: {
  gig: Gig & { distance?: number };
  index?: number;
}) {
  const Icon = gig.category ? getCategoryIcon(gig.category.slug) : Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/gigs/${gig.id}`}>
        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={gig.type === "need_help" ? "violet" : "emerald"}>
              {gig.type === "need_help" ? "Need Help" : "Available to Help"}
            </Badge>

            <Badge tone={URGENCY_TONE[gig.urgency]}>
              {URGENCY_LABEL[gig.urgency]}
            </Badge>
          </div>

          <h3 className="mt-3 font-bold text-lg text-gray-900 line-clamp-1">
            {gig.title}
          </h3>

          {gig.category && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-violet-600 font-medium">
              <Icon size={13} />
              {gig.subcategory?.name ?? gig.category.name}
            </div>
          )}

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {gig.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-violet-700">
              {formatPrice(gig)}
            </span>

            {gig.ownerVerified && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <BadgeCheck size={14} />
                Phone Verified
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={13} />
              {gig.distance != null
                ? `${gig.distance.toFixed(1)} km away`
                : gig.location.area}
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <MessageCircle size={13} />
              WhatsApp
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
