"use client";

import { useEffect, useRef } from "react";
import { GADS_ID, GADS_PURCHASE_LABEL } from "@/lib/ads";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara a conversão de COMPRA do Google Ads (uma vez), com valor e id do
 *  pedido. transaction_id evita contagem dupla em refresh. */
export function AdsConversion({ value, transactionId }: { value: number; transactionId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    if (!GADS_ID || !GADS_PURCHASE_LABEL || typeof window.gtag !== "function") return;
    fired.current = true;
    window.gtag("event", "conversion", {
      send_to: `${GADS_ID}/${GADS_PURCHASE_LABEL}`,
      value,
      currency: "BRL",
      transaction_id: transactionId,
    });
  }, [value, transactionId]);
  return null;
}
