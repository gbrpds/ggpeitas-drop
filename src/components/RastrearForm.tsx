"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ExternalLink, Package } from "lucide-react";
import { correiosLink } from "@/lib/correios";

export function RastrearForm() {
  const [code, setCode] = useState("");
  const clean = code.trim();

  function rastrear(e: React.FormEvent) {
    e.preventDefault();
    if (!clean) return;
    window.open(correiosLink(clean), "_blank", "noopener");
  }

  return (
    <div className="rastrear">
      <div className="rastrear-icon"><MapPin strokeWidth={1.6} /></div>
      <h1>Rastrear pedido</h1>
      <p>Digite o código de rastreio dos Correios que enviamos para você.</p>

      <form className="rastrear-form" onSubmit={rastrear}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: BR123456789BR"
          spellCheck={false}
          autoCapitalize="characters"
        />
        <button type="submit" disabled={!clean}>
          <ExternalLink size={17} /> Rastrear
        </button>
      </form>

      <div className="rastrear-hint">
        <Package size={15} /> Não tem o código? Ele aparece na página do seu pedido.
        <Link href="/pedidos">Ver meus pedidos</Link>
      </div>
    </div>
  );
}
