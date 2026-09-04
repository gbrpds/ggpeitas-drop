import { Star, StarHalf } from "lucide-react";

/** Exibe uma nota de 0 a 5 em estrelas (com meia estrela). */
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const full = value >= i;
        const half = !full && value >= i - 0.5;
        return (
          <span key={i} className="star">
            {full ? (
              <Star size={size} fill="currentColor" strokeWidth={0} />
            ) : half ? (
              <StarHalf size={size} fill="currentColor" strokeWidth={0} />
            ) : (
              <Star size={size} className="star-empty" strokeWidth={1.6} />
            )}
          </span>
        );
      })}
    </span>
  );
}
