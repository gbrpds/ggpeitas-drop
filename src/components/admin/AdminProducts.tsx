"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { brl } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  active: boolean;
  images: string[];
};

export function AdminProducts({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function del(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return <div className="cart-empty"><h2>Nenhum produto ainda</h2><p>Clique em “Novo produto” para cadastrar o primeiro.</p></div>;
  }

  return (
    <div className="adm-list">
      {rows.map((p) => (
        <div className="adm-row" key={p.id}>
          <div className="adm-row-media">
            {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span className="adm-noimg">sem foto</span>}
          </div>
          <div className="adm-row-info">
            <b>{p.name}</b>
            <span className="adm-row-cat">{p.category}</span>
          </div>
          <span className={`adm-badge ${p.active ? "on" : "off"}`}>{p.active ? "Ativo" : "Inativo"}</span>
          <b className="adm-row-price">{brl(p.priceCents / 100)}</b>
          <button className="adm-del" onClick={() => del(p.id, p.name)} disabled={busy === p.id} aria-label="Excluir">
            <Trash2 size={17} />
          </button>
        </div>
      ))}
    </div>
  );
}
