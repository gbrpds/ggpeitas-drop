"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Esvazia o carrinho ao montar (usado quando um pagamento acabou de ser confirmado). */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
