"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Crest } from "./Crest";

/**
 * Logo da loja. Coloque o arquivo em `public/logo.png` (referenciado como /logo.png).
 * Enquanto o arquivo não existir (ou falhar ao carregar), mostra o escudo + nome
 * como fallback — assim o header nunca fica com imagem quebrada.
 */
export function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Se a imagem falhou antes da hidratação, o evento onError não é capturado.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <>
        <Crest />
        <span>
          <b>GG PEITAS</b>
          <small>CAMISAS PREMIUM</small>
        </span>
      </>
    );
  }

  return (
    <img
      ref={ref}
      src="/logo.png"
      alt="GG Peitas"
      className={className ?? "logo"}
      onError={() => setFailed(true)}
    />
  );
}
