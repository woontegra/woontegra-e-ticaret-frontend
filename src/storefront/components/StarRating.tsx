import { Star } from 'lucide-react';

interface StarRatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarRatingDisplay({
  rating,
  size = 'md',
}: StarRatingDisplayProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            className={`${iconSize} ${
              filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            className="rounded p-0.5 transition-colors hover:scale-105"
            aria-label={`${starValue} yıldız`}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={`h-6 w-6 ${
                filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
