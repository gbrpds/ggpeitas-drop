"use client";

import { useEffect, useRef, useState } from "react";
import { PartyPopper, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { promoDiscountFromItems, PROMO_TITLE } from "@/lib/promo";

/** Avisa (toast) quando a promoção "Leve 3, Pague 2" é ativada no carrinho. */
export function PromoToast() {
  const items = useCart((s) => s.items);
  const [show, setShow] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    const disc = promoDiscountFromItems(
      items.map((i) => ({ priceCents: Math.round(i.price * 100), qty: i.qty, promo: !!i.promo })),
    );
    if (disc > 0 && prev.current === 0) setShow(true); // acabou de ativar
    prev.current = disc;
  }, [items]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="promo-toast" role="status">
      <PartyPopper size={18} />
      <span>
        Você ativou a promoção <b>{PROMO_TITLE}</b>! A mais barata sai grátis.
      </span>
      <button onClick={() => setShow(false)} aria-label="Fechar"><X size={16} /></button>
    </div>
  );
}
