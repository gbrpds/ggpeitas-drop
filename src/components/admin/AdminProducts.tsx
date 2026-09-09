"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Search } from "lucide-react";
import { brl } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  team: string | null;
  category: string;
  priceCents: number;
  active: boolean;
  inStock: boolean;
  promo3x2: boolean;
  images: string[];
};

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function AdminProducts({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [team, setTeam] = useState("");
  const [q, setQ] = useState("");

  // times distintos (ordenados) para o filtro
  const teams = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.team?.trim()) set.add(r.team.trim());
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return rows.filter((r) => {
      if (team && (r.team ?? "") !== team) return false;
      if (nq && !norm(r.name).includes(nq) && !norm(r.team ?? "").includes(nq)) return false;
      return true;
    });
  }, [rows, team, q]);

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
    <>
      <div className="adm-filters">
        <div className="adm-search">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou time…" />
        </div>
        <select value={team} onChange={(e) => setTeam(e.target.value)} className="adm-select">
          <option value="">Todos os times ({rows.length})</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(team || q) && (
          <button className="adm-filter-clear" onClick={() => { setTeam(""); setQ(""); }}>Limpar</button>
        )}
        <span className="adm-filter-count">{filtered.length} {filtered.length === 1 ? "produto" : "produtos"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="cart-empty"><h2>Nenhum produto para esse filtro</h2></div>
      ) : (
    <div className="adm-list">
      {filtered.map((p) => (
        <div className="adm-row" key={p.id}>
          <div className="adm-row-media">
            {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span className="adm-noimg">sem foto</span>}
          </div>
          <div className="adm-row-info">
            <b>{p.name}</b>
            <span className="adm-row-cat">{[p.team, p.category].filter(Boolean).join(" · ")}</span>
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
      )}
    </>
  );
}
