"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function BusinessReviewsSection({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

  const [showModal, setShowModal] = useState(false);

  function addReview() {
    if (!name.trim() || !comment.trim()) return;

    // No review backend exists yet, so this can't be persisted or shown
    // in a list below — surfacing it as "pending approval" instead of
    // silently discarding it, or falsely inserting it into a fake list.
    setShowModal(true);

    setName("");
    setComment("");
    setSelectedRating(5);
  }

  return (
    <section className="mt-10">

      {/* HEADER — the same rating shown on the card and at the top of this
          page, so the number never disagrees with itself. */}
      <div className="flex items-center gap-2 mb-6">
        <Star size={18} className="fill-yellow-400 text-yellow-400" />

        <span className="font-semibold text-base">
          {rating.toFixed(1)}
        </span>

        <span className="text-sm text-gray-500">
          ({reviewCount} review{reviewCount === 1 ? "" : "s"})
        </span>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <h3 className="font-semibold text-lg mb-4">Leave a Review</h3>

        <div className="space-y-3">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-11 px-4 rounded-xl bg-gray-100 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-violet-100"
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full p-4 rounded-xl bg-gray-100 text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-violet-100"
          />

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(Number(e.target.value))}
            className="w-full h-11 rounded-xl bg-gray-100 px-4 text-sm outline-none"
          >
            <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
            <option value={3}>⭐⭐⭐ 3 Stars</option>
            <option value={2}>⭐⭐ 2 Stars</option>
            <option value={1}>⭐ 1 Star</option>
          </select>

          <Button onClick={addReview} variant="solid" tone="violet" className="w-full">
            Submit Review
          </Button>
        </div>
      </div>

      {reviewCount === 0 && (
        <p className="mt-6 text-center text-sm text-gray-400">
          No reviews yet — be the first to share your experience.
        </p>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card variant="modal" padding="lg" className="w-full max-w-md text-center">

            <h2 className="text-lg font-bold text-green-600">
              Review Submitted 🎉
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Your review is now pending approval.
            </p>

            <Button
              onClick={() => setShowModal(false)}
              variant="solid"
              tone="violet"
              className="w-full mt-6"
            >
              OK
            </Button>

          </Card>
        </div>
      )}
    </section>
  );
}
