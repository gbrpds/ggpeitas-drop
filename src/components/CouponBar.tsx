"use client";

import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";

const CODE = "PRIMEIRA10";

/** Barrinha abaixo do menu anunciando o cupom de primeira compra. */
export function CouponBar() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <div className="coupon-bar">
      <div className="wrap coupon-bar-in">
        <span className="coupon-bar-txt">
          <Ticket size={15} strokeWidth={2.2} />
          <span>Primeira compra? Ganhe <b>10% OFF</b> com o cupom</span>
          <code>{CODE}</code>
        </span>
        <button type="button" className="coupon-bar-btn" onClick={copy} aria-label="Copiar cupom">
          {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
        </button>
      </div>
    </div>
  );
}
