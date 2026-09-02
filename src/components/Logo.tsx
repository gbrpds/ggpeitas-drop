"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Crest } from "./Crest";

/**
 * Marca da loja: emblema (public/logo.png) + nome "GG PEITAS".
 * Serve tanto no header (.brand) quanto no rodapé (.fbrand) — o dimensionamento
 * do emblema vem do CSS de cada contexto. Se o PNG falhar, usa o escudo SVG.
 */
export function Logo() {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Se a imagem falhou antes da hidratação, o evento onError não é capturado.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <>
      {failed ? (
        <Crest />
      ) : (
        <img
          ref={ref}
          src="/logo.png"
          alt="GG Peitas"
          className="logo"
          onError={() => setFailed(true)}
        />
      )}
      <span>
        <b>GG PEITAS</b>
        <small>CAMISAS PREMIUM</small>
      </span>
    </>
  );
}
