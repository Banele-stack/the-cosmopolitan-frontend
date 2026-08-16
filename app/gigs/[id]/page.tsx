"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  BadgeCheck,
  MessageCircle,
  Flag,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { getGig, updateGigStatus, deleteGig } from "@/features/gigs/services/gig.service";
import { getProfile } from "@/features/auth/services/auth.service";
import ReportModal from "@/features/reports/components/ReportModal";
import ListingStats from "@/components/common/ListingStats";
import TikTokFollow from "@/components/common/TikTokFollow";
import SocialLinkButton from "@/components/common/SocialLinkButton";
import ShareButton from "@/components/common/ShareButton";
import Badge from "@/components/ui/badge";
import Button, { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordView, recordContactClick } from "@/features/analytics/services/analytics.service";
import { Gig } from "@/features/gigs/types";

const URGENCY_LABEL: Record<Gig["urgency"], string> = {
  today: "Today",
  this_week: "This week",
  flexible: "Flexible",
};

function formatPrice(gig: Gig): string {
  if (gig.priceType === "negotiable" || gig.price == null) return "Negotiable";

  const amount = `R${new Intl.NumberFormat("en-ZA").format(gig.price)}`;
  return gig.priceType === "hourly" ? `${amount}/hr` : amount;
}

export default function GigPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);

  // With the browser's own scroll restoration turned off app-wide (see
  // ScrollRestorationManager), every page has to explicitly decide where
  // it starts — this keeps two different gigs visited back to back from
  // inheriting whatever scroll depth the previous one left.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (isNaN(id)) return;

    const fetchGig = async () => {
      try {
        const data = await getGig(id);
        setGig(data);
      } catch (error) {
        console.error("Failed to fetch gig:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

  // Ownership check is best-effort and separate from the fetch above (it
  // needs the gig loaded first to compare ownerId): if there's no token, or
  // the profile lookup fails, isOwner just stays false and the owner-only
  // action (Mark as filled) doesn't show — same "fail closed" behaviour as
  // every other auth-gated action in this app.
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);

  useEffect(() => {
    if (!gig) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setOwnerCheckDone(true);
      return;
    }

    getProfile()
      .then((profile) => setIsOwner(profile.id === gig.ownerId))
      .catch(() => {})
      .finally(() => setOwnerCheckDone(true));
  }, [gig]);

  // Record a view once we know whether this is the owner browsing their own
  // post — the owner's own visits don't count. See ListingStats for where
  // this shows up.
  useEffect(() => {
    if (!gig || !ownerCheckDone || isOwner) return;
    recordView("gig", gig.id);
  }, [gig, ownerCheckDone, isOwner]);

  async function markFilled() {
    if (!gig) return;

    setUpdatingStatus(true);

    try {
      const updated = await updateGigStatus(gig.id, "filled");
      setGig(updated);
    } catch (error: any) {
      alert(error.message || "Failed to update.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!gig) return;
    if (!confirm(`Delete "${gig.title}"? This can't be undone.`)) return;

    setDeleting(true);

    try {
      await deleteGig(gig.id);
      toast.success("Piece job deleted");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to delete.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Piece job not found
        </div>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${gig.whatsappNumber.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(
    `Hi, I saw your "${gig.title}" post on Piece Jobs`
  )}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gig.location.lat},${gig.location.lng}`;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <ShareButton
            title={gig.title}
            text={`Check out this piece job on The Cosmopolitan: ${gig.title}`}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge tone={gig.type === "need_help" ? "violet" : "emerald"}>
              {gig.type === "need_help" ? "Need Help" : "Available to Help"}
            </Badge>

            <Badge tone="amber">{URGENCY_LABEL[gig.urgency]}</Badge>

            {gig.status === "filled" && <Badge tone="gray">Filled</Badge>}
          </div>

          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
            {gig.title}
          </h1>

          {gig.category && (
            <p className="mt-1 text-violet-600 font-medium text-sm">
              {gig.category.name}
              {gig.subcategory && ` › ${gig.subcategory.name}`}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin size={15} />
              {gig.location.address}
            </div>

            {gig.ownerVerified && (
              <div className="flex items-center gap-1 text-green-600">
                <BadgeCheck size={15} />
                Phone Verified
              </div>
            )}
          </div>

          {isOwner && (
            <ListingStats
              viewCount={gig.viewCount}
              contactClickCount={gig.contactClickCount}
            />
          )}

          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-2">Details</h2>
            <p className="text-gray-600 leading-7">{gig.description}</p>
          </div>

          <div className="mt-6 flex items-center gap-2 bg-violet-50 rounded-xl px-4 py-3">
            <span className="text-xl font-bold text-violet-700">
              {formatPrice(gig)}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Location</h2>
            <iframe
              className="w-full h-[250px] rounded-xl"
              loading="lazy"
              src={`https://www.google.com/maps?q=${gig.location.lat},${gig.location.lng}&z=17&output=embed`}
            />
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-center py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition"
            >
              Get Directions
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Piece Jobs doesn't handle payments — meet safely and agree on
            payment directly.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {gig.status === "active" && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordContactClick("gig", gig.id)}
                className={cn(buttonVariants({ variant: "solid", tone: "emerald", size: "lg" }), "w-full")}
              >
                <MessageCircle size={18} />
                Contact via WhatsApp
              </a>
            )}

            <TikTokFollow url={gig.ownerTiktokUrl} />
            <SocialLinkButton url={gig.ownerSocialUrl} />

            {isOwner && gig.status !== "filled" && (
              <Button
                onClick={markFilled}
                loading={updatingStatus}
                variant="outline"
                size="lg"
                className="w-full hover:border-green-300 hover:text-green-700"
              >
                <CheckCircle2 size={18} />
                Mark as Filled
              </Button>
            )}

            {isOwner && (
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/gigs/${gig.id}/edit`)}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Pencil size={18} />
                  Edit
                </Button>

                <Button
                  onClick={handleDelete}
                  loading={deleting}
                  variant="danger-outline"
                  size="lg"
                  className="w-full"
                >
                  <Trash2 size={18} />
                  Delete
                </Button>
              </div>
            )}

            {!isOwner && (
              <button
                onClick={() => setReportOpen(true)}
                className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1"
              >
                <Flag size={12} />
                Report this post
              </button>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="gig"
        targetId={gig.id}
        title="Report Post"
        reasonOptions={[
          "Fake post",
          "Scam / fraud",
          "Inappropriate content",
          "Already filled / stale",
        ]}
      />
    </main>
  );
}
