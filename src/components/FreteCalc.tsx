"use client";

import { useState } from "react";
import { Truck, X } from "lucide-react";
import { brl } from "@/lib/format";
import { shippingForUf, FREE_SHIPPING_MIN, DELIVERY_ESTIMATE } from "@/lib/shipping";

type Result = { label: string; cents: number; local: string; free: boolean };

/** Link verde "Calcular frete" + modal que estima o frete por CEP e região. */
export function FreteCalc({ subtotal = 0, className = "cd-frete-calc" }: { subtotal?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function fmtCep(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP válido (8 dígitos).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const d = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then((r) => r.json());
      if (d.erro) {
        setError("CEP não encontrado.");
      } else {
        const s = shippingForUf(d.uf);
        const local = [d.localidade, d.uf].filter(Boolean).join(" - ");
        setResult({ ...s, local, free: subtotal >= FREE_SHIPPING_MIN });
      }
    } catch {
      setError("Não foi possível consultar o CEP agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Calcular frete pelo CEP
      </button>

      {open && (
        <div className="fc-scrim" onClick={() => setOpen(false)}>
          <div className="fc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fc-head">
              <b><Truck size={18} /> Calcular frete</b>
              <button className="fc-close" onClick={() => setOpen(false)} aria-label="Fechar"><X size={20} /></button>
            </div>

            <form className="fc-form" onSubmit={calcular}>
              <input
                value={cep}
                onChange={(e) => setCep(fmtCep(e.target.value))}
                placeholder="Seu CEP (00000-000)"
                inputMode="numeric"
                autoFocus
              />
              <button type="submit" disabled={loading}>{loading ? "…" : "Calcular"}</button>
            </form>

            {error && <div className="fc-err">{error}</div>}

            {result && (
              <div className="fc-result">
                <div className="fc-local">{result.local} · <span>{result.label}</span></div>
                {result.free ? (
                  <div className="fc-free">Frete <b>GRÁTIS</b> <span>(pedido acima de {brl(FREE_SHIPPING_MIN)})</span></div>
                ) : (
                  <div className="fc-price">
                    <span>Frete</span> <b>{brl(result.cents / 100)}</b>
                  </div>
                )}
                <div className="fc-prazo">Entrega estimada: <b>{DELIVERY_ESTIMATE}</b></div>
                {!result.free && (
                  <div className="fc-hint">Frete <b>grátis</b> em compras acima de {brl(FREE_SHIPPING_MIN)}.</div>
                )}
              </div>
            )}

            <p className="fc-note">Produtos importados — entrega em {DELIVERY_ESTIMATE} após a confirmação do pagamento.</p>
          </div>
        </div>
      )}
    </>
  );
}
