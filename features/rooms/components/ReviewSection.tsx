"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, LogIn } from "lucide-react";
import { Review } from "@/features/rooms/types";
import { submitReview } from "@/features/rooms/services/room.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewSection({
  roomId,
  reviews,
}: {
  roomId: number;
  reviews: Review[];
}) {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  async function addReview() {
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await submitReview(roomId, { rating, comment: comment.trim() });
      setShowModal(true);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-10">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Star
          size={18}
          className="fill-yellow-400 text-yellow-400"
        />

        <span className="font-semibold text-base">
          {avgRating.toFixed(1)}
        </span>

        <span className="text-sm text-gray-500">
          ({reviews.length} reviews)
        </span>
      </div>

      {/* FORM — only shown once we know whether there's a session; logged
          out visitors get a login prompt instead, since a review's name
          now comes from the account, not a typed-in field. */}
      {isLoggedIn === false ? (
        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] text-center">
          <p className="text-sm text-gray-600">
            Log in to leave a review for this listing.
          </p>
          <button
            onClick={() => router.push(`/auth/login?next=/rooms/${roomId}`)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            <LogIn size={15} />
            Log in
          </button>
        </div>
      ) : isLoggedIn === true ? (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
          <h3 className="font-semibold text-lg mb-4">
            Leave a Review
          </h3>

          <div className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={1000}
              className="w-full p-4 rounded-xl bg-gray-100 text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-violet-100"
            />

            <Select
              value={rating.toString()}
              onValueChange={(value) => setRating(Number(value))}
            >
              <SelectTrigger className="h-11 rounded-xl bg-gray-100 border-0">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                <SelectItem value="1">⭐ 1 Star</SelectItem>
              </SelectContent>
            </Select>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              onClick={addReview}
              disabled={submitting || !comment.trim()}
              className="w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      ) : null}

      {/* APPROVED REVIEWS ONLY — the backend only ever returns approved
          ones here, so no client-side filtering is needed. */}
      <div className="space-y-4 mt-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-sm">{review.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString("en-ZA")}
                </p>
              </div>

              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center">

            <h2 className="text-lg font-bold text-green-600">
              Review Submitted 🎉
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Your review is now pending approval.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-violet-600 text-white py-3 rounded-xl"
            >
              OK
            </button>

          </div>
        </div>
      )}
    </section>
  );
}
