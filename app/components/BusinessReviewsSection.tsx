"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface BusinessReview {
  id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export default function BusinessReviewsSection() {
  // ONLY approved reviews
  const [reviews] = useState<BusinessReview[]>([
    {
      id: "1",
      name: "John Doe",
      comment:
        "Excellent service and very professional staff. Highly recommended.",
      rating: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Sarah Smith",
      comment: "Great experience overall. Will definitely come back again.",
      rating: 4,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [pendingReview, setPendingReview] = useState<BusinessReview | null>(
    null
  );

  function addReview() {
    if (!name.trim() || !comment.trim()) return;

    const newReview: BusinessReview = {
      id: Date.now().toString(),
      name,
      comment,
      rating,
      createdAt: new Date().toISOString(),
    };

    // DO NOT add to list immediately
    setPendingReview(newReview);
    setShowModal(true);

    setName("");
    setComment("");
    setRating(5);
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-10">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Star size={18} className="fill-yellow-400 text-yellow-400" />

        <span className="font-semibold text-base">
          {avgRating.toFixed(1)}
        </span>

        <span className="text-sm text-gray-500">
          ({reviews.length} reviews)
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
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full h-11 rounded-xl bg-gray-100 px-4 text-sm outline-none"
          >
            <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
            <option value={3}>⭐⭐⭐ 3 Stars</option>
            <option value={2}>⭐⭐ 2 Stars</option>
            <option value={1}>⭐ 1 Star</option>
          </select>

          <button
            onClick={addReview}
            className="w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
          >
            Submit Review
          </button>
        </div>
      </div>

      {/* REVIEWS */}
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
                  {new Date(review.createdAt).toISOString().split("T")[0]}
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
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center shadow-2xl">

            <h2 className="text-lg font-bold text-green-600">
              Review Submitted 🎉
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Your review is now pending approval.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                setPendingReview(null);
              }}
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