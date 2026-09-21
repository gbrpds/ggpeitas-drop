"use client";

import { useEffect } from "react";

/** Guarda o Google Click ID (gclid) num cookie por 90 dias quando o visitante
 *  chega por um anúncio (URL com ?gclid=...). O checkout lê esse cookie e marca
 *  o pedido como vindo do Google Ads. */
export function AdTracking() {
  useEffect(() => {
    try {
      const g = new URLSearchParams(window.location.search).get("gclid");
      if (g) {
        document.cookie = `gg_gclid=${encodeURIComponent(g)};path=/;max-age=${60 * 60 * 24 * 90};samesite=lax`;
      }
    } catch {}
  }, []);
  return null;
}
