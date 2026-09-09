"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [items, setItems] = useState<Row[]>(rows);
  useEffect(() => setItems(rows), [rows]); // sincroniza quando o servidor manda dados novos
  const [busy, setBusy] = useState<string | null>(null);
  const [team, setTeam] = useState("");
  const [q, setQ] = useState("");

  const teams = useMemo(() => {
    const set = new Set<string>();
    for (const r of items) if (r.team?.trim()) set.add(r.team.trim());
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [items]);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return items.filter((r) => {
      if (team && (r.team ?? "") !== team) return false;
      if (nq && !norm(r.name).includes(nq) && !norm(r.team ?? "").includes(nq)) return false;
      return true;
    });
  }, [items, team, q]);

  // atualiza um campo booleano no banco + localmente (sem recarregar a página)
  async function patch(id: string, field: "active" | "inStock" | "promo3x2", value: boolean) {
    setBusy(id);
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch {
      // reverte em caso de falha
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: !value } : r)));
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    setBusy(id);
    const snapshot = items;
    setItems((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) setItems(snapshot); // reverte
    } catch {
      setItems(snapshot);
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
          <option value="">Todos os times ({items.length})</option>
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
        <div className="apc-grid">
          {filtered.map((p) => (
            <div className={`apc${p.active ? "" : " off"}`} key={p.id}>
              <div className="apc-media">
                {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span className="adm-noimg">sem foto</span>}
                <div className="apc-icons">
                  <Link className="apc-icon" href={`/admin/produto/${p.id}`} aria-label="Editar"><Pencil size={15} /></Link>
                  <button className="apc-icon danger" onClick={() => del(p.id, p.name)} disabled={busy === p.id} aria-label="Excluir"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="apc-body">
                <b className="apc-name">{p.name}</b>
                <span className="apc-sub">{[p.team, p.category].filter(Boolean).join(" · ")}</span>
                <b className="apc-price">{brl(p.priceCents / 100)}</b>

                <div className="apc-toggles">
                  <label className="adm-toggle" title={p.active ? "Ativo na loja" : "Oculto da loja"}>
                    <input type="checkbox" checked={p.active} disabled={busy === p.id} onChange={() => patch(p.id, "active", !p.active)} />
                    <span className={`adm-toggle-track${p.active ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">{p.active ? "Ativo" : "Inativo"}</span>
                  </label>
                  <label className="adm-toggle" title={p.inStock ? "Em estoque" : "Sem estoque (waitlist ativa)"}>
                    <input type="checkbox" checked={p.inStock} disabled={busy === p.id} onChange={() => patch(p.id, "inStock", !p.inStock)} />
                    <span className={`adm-toggle-track${p.inStock ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">{p.inStock ? "Estoque" : "Esgotado"}</span>
                  </label>
                  <label className="adm-toggle" title={p.promo3x2 ? "Na promoção Leve 3 Pague 2" : "Fora da promoção"}>
                    <input type="checkbox" checked={p.promo3x2} disabled={busy === p.id} onChange={() => patch(p.id, "promo3x2", !p.promo3x2)} />
                    <span className={`adm-toggle-track${p.promo3x2 ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">3x2</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
