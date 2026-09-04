"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Ticket } from "lucide-react";
import { brl } from "@/lib/format";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minCents: number;
  maxUses: number | null;
  expiresAt: string | null;
  active: boolean;
};

export function AdminCoupons({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [min, setMin] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expires, setExpires] = useState("");

  const reais = (v: string) => Math.round(parseFloat(v.replace(",", ".")) * 100);

  async function criar() {
    setError(null);
    if (code.trim().length < 3) return setError("Código deve ter ao menos 3 caracteres.");
    const v = type === "percent" ? parseInt(value, 10) : reais(value);
    if (!v || v <= 0) return setError("Informe um valor válido.");
    if (type === "percent" && v > 100) return setError("Percentual máximo é 100%.");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: v,
          minCents: min ? reais(min) : 0,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          expiresAt: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar.");
      } else {
        setCode(""); setValue(""); setMin(""); setMaxUses(""); setExpires("");
        router.refresh();
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    setBusy(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string, code: string) {
    if (!confirm(`Excluir o cupom "${code}"?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="cpn-form">
        <div className="cpn-form-grid">
          <label><span>Código</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ex: BEMVINDO10" />
          </label>
          <label><span>Tipo</span>
            <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}>
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </label>
          <label><span>{type === "percent" ? "Desconto (%)" : "Desconto (R$)"}</span>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "20,00"} inputMode="decimal" />
          </label>
          <label><span>Pedido mín. (R$)</span>
            <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="opcional" inputMode="decimal" />
          </label>
          <label><span>Limite de usos</span>
            <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="ilimitado" inputMode="numeric" />
          </label>
          <label><span>Validade</span>
            <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </label>
        </div>
        {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}
        <button className="cpn-add" onClick={criar} disabled={saving}>
          <Plus size={16} /> {saving ? "Criando…" : "Criar cupom"}
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="cart-empty"><Ticket strokeWidth={1.5} /><h2>Nenhum cupom ainda</h2></div>
      ) : (
        <div className="cpn-list">
          {initial.map((c) => {
            const expired = c.expiresAt ? new Date(c.expiresAt).getTime() < Date.now() : false;
            return (
              <div className="cpn-row" key={c.id}>
                <div className="cpn-code"><Ticket size={16} /> <b>{c.code}</b></div>
                <div className="cpn-info">
                  <span className="cpn-val">
                    {c.type === "percent" ? `${c.value}% OFF` : `${brl(c.value / 100)} OFF`}
                  </span>
                  {c.minCents > 0 && <span className="cpn-tag">mín. {brl(c.minCents / 100)}</span>}
                  {c.maxUses != null && <span className="cpn-tag">máx. {c.maxUses} usos</span>}
                  {c.expiresAt && (
                    <span className={`cpn-tag${expired ? " exp" : ""}`}>
                      {expired ? "expirado" : `até ${new Date(c.expiresAt).toLocaleDateString("pt-BR")}`}
                    </span>
                  )}
                </div>
                <label className="adm-toggle" title={c.active ? "Ativo" : "Inativo"}>
                  <input type="checkbox" checked={c.active} disabled={busy === c.id} onChange={() => toggle(c.id, c.active)} />
                  <span className={`adm-toggle-track${c.active ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                  <span className="adm-toggle-label">{c.active ? "Ativo" : "Inativo"}</span>
                </label>
                <button className="adm-del" onClick={() => del(c.id, c.code)} disabled={busy === c.id} aria-label="Excluir">
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
