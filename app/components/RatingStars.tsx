import { Star } from "lucide-react";

export default function RatingStars() {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className="text-yellow-500" />
      ))}
    </div>
  );
}