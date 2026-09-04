"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export type OrderFilterValues = {
  status?: string;
  from?: string;
  to?: string;
  q?: string;
};

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export function AdminOrderFilters({ initial }: { initial: OrderFilterValues }) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status ?? "");
  const [from, setFrom] = useState(initial.from ?? "");
  const [to, setTo] = useState(initial.to ?? "");
  const [q, setQ] = useState(initial.q ?? "");

  function apply(next: OrderFilterValues) {
    const p = new URLSearchParams();
    if (next.status) p.set("status", next.status);
    if (next.from) p.set("from", next.from);
    if (next.to) p.set("to", next.to);
    if (next.q?.trim()) p.set("q", next.q.trim());
    const qs = p.toString();
    router.push(qs ? `/admin/pedidos?${qs}` : "/admin/pedidos");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    apply({ status, from, to, q });
  }

  function preset(days: number) {
    const f = todayStr(days);
    const t = todayStr(0);
    setFrom(f);
    setTo(t);
    apply({ status, from: f, to: t, q });
  }

  function clearAll() {
    setStatus("");
    setFrom("");
    setTo("");
    setQ("");
    router.push("/admin/pedidos");
  }

  const hasFilter = !!(status || from || to || q.trim());

  return (
    <form className="ordf" onSubmit={submit}>
      <div className="ordf-row">
        <label className="ordf-field">
          <span><SlidersHorizontal size={13} /> Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="pending">Em aberto</option>
            <option value="approved">Pago</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
        <label className="ordf-field">
          <span>De</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="ordf-field">
          <span>Até</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="ordf-field ordf-grow">
          <span><Search size={13} /> Buscar</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nº do pedido, nome ou e-mail"
          />
        </label>
        <button className="ordf-apply" type="submit">Filtrar</button>
        {hasFilter && (
          <button className="ordf-clear" type="button" onClick={clearAll}>
            <X size={14} /> Limpar
          </button>
        )}
      </div>
      <div className="ordf-presets">
        <button type="button" onClick={() => preset(0)}>Hoje</button>
        <button type="button" onClick={() => preset(7)}>7 dias</button>
        <button type="button" onClick={() => preset(30)}>30 dias</button>
      </div>
    </form>
  );
}
