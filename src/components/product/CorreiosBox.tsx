"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

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
        <img src="/correios.png" alt="Correios" />
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
