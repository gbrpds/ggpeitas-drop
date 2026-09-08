"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { Address } from "@/lib/account";

export function AccountDataForm({
  initial,
}: {
  initial: { name: string | null; email: string; cpf: string | null; phone: string | null; address: Address | null };
}) {
  const router = useRouter();
  const [cpf, setCpf] = useState(initial.cpf ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [a, setA] = useState<Address>(
    initial.address ?? { cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "", complemento: "" },
  );
  const [cepLoading, setCepLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookupCep(raw: string) {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const d = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((r) => r.json());
      if (!d.erro) {
        setA((s) => ({ ...s, rua: d.logradouro || s.rua, bairro: d.bairro || s.bairro, cidade: d.localidade || s.cidade, uf: d.uf || s.uf }));
      }
    } catch {
      /* silencioso */
    } finally {
      setCepLoading(false);
    }
  }

  async function salvar() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const hasAddr = a.cep && a.rua && a.numero;
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, phone, address: hasAddr ? a : null }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Não foi possível salvar.");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="acc-data">
      <div className="co-field">
        <label>Nome</label>
        <input value={initial.name ?? ""} disabled />
      </div>
      <div className="co-row">
        <div className="co-field">
          <label>CPF</label>
          <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
        </div>
        <div className="co-field">
          <label>Telefone (WhatsApp)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" inputMode="tel" />
        </div>
      </div>

      <h3 className="acc-data-sub">Endereço padrão</h3>
      <div className="co-row">
        <div className="co-field">
          <label>CEP {cepLoading && <span className="co-hint">buscando…</span>}</label>
          <input value={a.cep} onChange={(e) => { const v = e.target.value; setA({ ...a, cep: v }); lookupCep(v); }} placeholder="00000-000" inputMode="numeric" />
        </div>
        <div className="co-field">
          <label>Número</label>
          <input value={a.numero} onChange={(e) => setA({ ...a, numero: e.target.value })} placeholder="123" inputMode="numeric" />
        </div>
      </div>
      <div className="co-field">
        <label>Rua</label>
        <input value={a.rua} onChange={(e) => setA({ ...a, rua: e.target.value })} placeholder="Preenchido pelo CEP" />
      </div>
      <div className="co-field">
        <label>Complemento (opcional)</label>
        <input value={a.complemento ?? ""} onChange={(e) => setA({ ...a, complemento: e.target.value })} placeholder="Apto, bloco…" />
      </div>
      <div className="co-field">
        <label>Bairro</label>
        <input value={a.bairro} onChange={(e) => setA({ ...a, bairro: e.target.value })} />
      </div>
      <div className="co-row">
        <div className="co-field">
          <label>Cidade</label>
          <input value={a.cidade} onChange={(e) => setA({ ...a, cidade: e.target.value })} />
        </div>
        <div className="co-field co-uf">
          <label>UF</label>
          <input value={a.uf} maxLength={2} onChange={(e) => setA({ ...a, uf: e.target.value.toUpperCase() })} />
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      <button className="co-next" onClick={salvar} disabled={saving}>
        {saving ? <Loader2 size={18} className="spin" /> : saved ? <><Check size={18} /> Salvo!</> : "Salvar dados"}
      </button>
    </div>
  );
}
