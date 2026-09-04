"use client";

import { useState } from "react";
import { Truck, Check, ExternalLink } from "lucide-react";
import { correiosLink, SHIPPING_STAGES } from "@/lib/correios";

export function AdminOrderTracking({
  orderId,
  initialCode,
  initialStage,
}: {
  orderId: string;
  initialCode: string | null;
  initialStage: string | null;
}) {
  const [code, setCode] = useState(initialCode ?? "");
  const [stage, setStage] = useState(initialStage ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCode: code.trim() || null,
          shippingStatus: stage || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Falha ao salvar.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ord-track">
      <div className="ord-track-row">
        <label>
          <span><Truck size={13} /> Código de rastreio</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BR123456789BR"
            spellCheck={false}
          />
        </label>
        <label>
          <span>Etapa</span>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">—</option>
            {SHIPPING_STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
        <button className="ord-track-save" onClick={save} disabled={saving}>
          {saving ? "Salvando…" : saved ? <><Check size={14} /> Salvo</> : "Salvar"}
        </button>
      </div>
      {code.trim() && (
        <a className="ord-track-link" href={correiosLink(code)} target="_blank" rel="noopener">
          <ExternalLink size={13} /> Abrir nos Correios
        </a>
      )}
      {error && <span className="ord-track-err">{error}</span>}
    </div>
  );
}
