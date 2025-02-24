
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ rating, onRatingChange, disabled }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          className={cn(
            "p-0 w-6 h-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm disabled:cursor-default",
            disabled && "cursor-default"
          )}
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300",
              !disabled && "hover:fill-yellow-200 hover:text-yellow-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}
