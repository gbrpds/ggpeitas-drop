"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara a conversão de COMPRA do Google Ads (uma vez), com valor e id do
 *  pedido. Só age se NEXT_PUBLIC_GADS_ID e NEXT_PUBLIC_GADS_PURCHASE_LABEL
 *  estiverem definidos. transaction_id evita contagem dupla em refresh. */
export function AdsConversion({ value, transactionId }: { value: number; transactionId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    const id = process.env.NEXT_PUBLIC_GADS_ID;
    const label = process.env.NEXT_PUBLIC_GADS_PURCHASE_LABEL;
    if (!id || !label || typeof window.gtag !== "function") return;
    fired.current = true;
    window.gtag("event", "conversion", {
      send_to: `${id}/${label}`,
      value,
      currency: "BRL",
      transaction_id: transactionId,
    });
  }, [value, transactionId]);
  return null;
}
