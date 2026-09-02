"use client";

import { useEffect, useState } from "react";

function CorreiosLogo() {
  return (
    <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
      <rect x="4" y="18" width="56" height="30" rx="5" fill="#004b8d" />
      <path d="M12 26h30l8 7-8 7H12z" fill="#ffd200" />
      <path d="M20 30l8 3-8 3zM30 30l8 3-8 3z" fill="#004b8d" />
      <text x="32" y="58" textAnchor="middle" fontFamily="Archivo,sans-serif" fontWeight="800" fontSize="9" fill="#004b8d">
        CORREIOS
      </text>
    </svg>
  );
}

export function CorreiosBox() {
  const [regiao, setRegiao] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const r = await fetch("https://ipapi.co/json/");
        if (!r.ok) return;
        const d = await r.json();
        const cidade = d.city as string | undefined;
        const uf = d.region_code as string | undefined;
        if (ok && cidade) setRegiao(uf ? `${cidade}, ${uf}` : cidade);
      } catch {
        /* mantém o fallback */
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  return (
    <div className="correios">
      <span className="cimg">
        <CorreiosLogo />
      </span>
      <div className="cinfo">
        <b>Entrega via Correios®</b>
        <span>
          Envio para <b>{regiao ? `${regiao} e Região` : "todo o Brasil"}</b>
        </span>
      </div>
      <span className="cfree">Frete Grátis</span>
    </div>
  );
}
