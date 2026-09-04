"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { brl } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  active: boolean;
  inStock: boolean;
  promo3x2: boolean;
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

  async function toggle(id: string, active: boolean) {
    setBusy(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  // ao marcar "em estoque" de novo, o servidor dispara os e-mails da waitlist
  async function toggleStock(id: string, inStock: boolean) {
    setBusy(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !inStock }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function togglePromo(id: string, promo3x2: boolean) {
    setBusy(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promo3x2: !promo3x2 }),
      });
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
          <b className="adm-row-price">{brl(p.priceCents / 100)}</b>
          <label className="adm-toggle" title={p.active ? "Ativo na loja" : "Oculto da loja"}>
            <input type="checkbox" checked={p.active} disabled={busy === p.id} onChange={() => toggle(p.id, p.active)} />
            <span className={`adm-toggle-track${p.active ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
            <span className="adm-toggle-label">{p.active ? "Ativo" : "Inativo"}</span>
          </label>
          <label className="adm-toggle" title={p.inStock ? "Em estoque" : "Sem estoque (waitlist ativa)"}>
            <input type="checkbox" checked={p.inStock} disabled={busy === p.id} onChange={() => toggleStock(p.id, p.inStock)} />
            <span className={`adm-toggle-track${p.inStock ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
            <span className="adm-toggle-label">{p.inStock ? "Estoque" : "Esgotado"}</span>
          </label>
          <label className="adm-toggle" title={p.promo3x2 ? "Na promoção Leve 3 Pague 2" : "Fora da promoção"}>
            <input type="checkbox" checked={p.promo3x2} disabled={busy === p.id} onChange={() => togglePromo(p.id, p.promo3x2)} />
            <span className={`adm-toggle-track${p.promo3x2 ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
            <span className="adm-toggle-label">3x2</span>
          </label>
          <Link className="adm-edit" href={`/admin/produto/${p.id}`} aria-label="Editar"><Pencil size={16} /></Link>
          <button className="adm-del" onClick={() => del(p.id, p.name)} disabled={busy === p.id} aria-label="Excluir">
            <Trash2 size={17} />
          </button>
        </div>
      ))}
    </div>
  );
}
