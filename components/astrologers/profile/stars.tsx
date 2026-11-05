import { Star } from 'lucide-react';

/** 0-5 stars with a partly filled last star (the app's quarter steps look the same at this size). */
export function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const value = Math.max(0, Math.min(5, rating || 0));
  return (
    <span
      className={`inline-flex gap-0.5 ${className ?? ''}`}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              className="absolute inset-0 text-[#F59236]/30"
              style={{ width: size, height: size }}
              fill="currentColor"
              strokeWidth={0}
            />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-[#F59236]"
                style={{ width: size, height: size }}
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
