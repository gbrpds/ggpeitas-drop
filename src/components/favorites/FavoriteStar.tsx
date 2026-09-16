"use client";

import { Star } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";

/** Estrela de favoritar — só aparece para usuários logados. */
export function FavoriteStar({ productId }: { productId: string }) {
  const { loggedIn, isFav, toggle } = useFavorites();
  if (!loggedIn) return null;
  const on = isFav(productId);
  return (
    <button
      type="button"
      className={`fav-star${on ? " on" : ""}`}
      aria-label={on ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
    >
      <Star size={18} strokeWidth={2} fill={on ? "currentColor" : "none"} />
    </button>
  );
}
