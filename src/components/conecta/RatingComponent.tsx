import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingComponentProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
  readonly?: boolean;
}

const RatingComponent = ({ 
  rating, 
  onRatingChange, 
  className,
  readonly = false 
}: RatingComponentProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (star: number) => {
    if (!readonly) {
      onRatingChange(star);
    }
  };

  const handleStarHover = (star: number) => {
    if (!readonly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
            className={cn(
              "transition-colors duration-150",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors duration-150",
                isActive 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingComponent;