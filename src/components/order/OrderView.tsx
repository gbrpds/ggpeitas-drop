"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, QrCode, CreditCard, Clock, XCircle, ArrowRight, Package, Truck, MapPin, ExternalLink } from "lucide-react";
import { brl } from "@/lib/format";
import { PixDisplay } from "@/components/checkout/PixDisplay";
import { correiosLink, SHIPPING_STAGES } from "@/lib/correios";

type Item = { id: string; name: string; price: number; qty: number };
type Order = {
  id: string;
  number: string | null;
  status: string;
  paymentMethod: string;
  totalCents: number;
  items: Item[];
  trackingCode?: string | null;
  shippingStatus?: string | null;
};

export function OrderView({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [payMethod, setPayMethod] = useState<"pix" | "card" | null>(null);
  const [pix, setPix] = useState<{ qrCode?: string; qrCodeBase64?: string; paymentId?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = order.totalCents / 100;

  // Polling do PIX enquanto aguarda pagamento
  useEffect(() => {
    if (!pix?.paymentId || status === "approved") return;
    const poll = setInterval(async () => {
      try {
        const s = await fetch(`/api/checkout/status?paymentId=${pix.paymentId}`).then((r) => r.json());
        if (s.status === "approved") {
          clearInterval(poll);
          setStatus("approved");
        }
      } catch {
        /* ignora */
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [pix?.paymentId, status]);

  async function gerarPix() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/pix`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Não foi possível gerar o PIX.");
      else if (data.status === "approved") setStatus("approved");
      else setPix({ qrCode: data.qrCode, qrCodeBase64: data.qrCodeBase64, paymentId: String(data.paymentId) });
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function pagarCartao() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/preference`, { method: "POST" });
      const data = await res.json();
      if (data.status === "approved") {
        setStatus("approved");
        return;
      }
      if (!res.ok || !data.initPoint) {
        setError(data.error ?? "Não foi possível abrir o checkout do Mercado Pago.");
        return;
      }
      window.location.href = data.initPoint; // ambiente do Mercado Pago
    } catch {
      setError("Falha de conexão ao abrir o checkout.");
    } finally {
      setLoading(false);
    }
  }

  const summary = (
    <div className="ov-summary">
      <div className="co-items">
        {order.items.map((i, idx) => (
          <div className="co-item" key={idx}>
            <div className="co-item-info">
              <span className="co-item-name">{i.name}</span>
              <span className="co-item-qty">{i.qty} × {brl(i.price)}</span>
            </div>
            <b>{brl(i.price * i.qty)}</b>
          </div>
        ))}
      </div>
      <div className="cs-total"><span>Total</span><b>{brl(total)}</b></div>
    </div>
  );

  // ---- Pedido confirmado ----
  if (status === "approved") {
    // etapas de envio: Pago (sempre) → Preparando → Enviado → Entregue
    const stageIcons: Record<string, typeof Package> = {
      preparando: Package,
      enviado: Truck,
      entregue: MapPin,
    };
    const currentIdx = SHIPPING_STAGES.findIndex((s) => s.key === order.shippingStatus);
    const steps = [
      { key: "pago", label: "Pago", Icon: Check, done: true },
      ...SHIPPING_STAGES.map((s, i) => ({
        key: s.key,
        label: s.label,
        Icon: stageIcons[s.key],
        done: currentIdx >= i,
      })),
    ];

    return (
      <div className="co-result">
        <div className="co-result-icon ok"><Check strokeWidth={3} /></div>
        <h2>Pedido confirmado!</h2>
        {order.number && <div className="co-order-num">Pedido <b>#{order.number}</b></div>}
        <p>Recebemos seu pagamento — acompanhe o envio abaixo. Obrigado! 💚</p>

        <div className="ov-track">
          <div className="ov-track-steps">
            {steps.map((s, i) => (
              <div key={s.key} className={`ov-track-step${s.done ? " done" : ""}${i > 0 ? " has-bar" : ""}`}>
                <span className="ov-track-dot"><s.Icon size={16} strokeWidth={2.2} /></span>
                <span className="ov-track-label">{s.label}</span>
              </div>
            ))}
          </div>
          {order.trackingCode ? (
            <div className="ov-track-code">
              <div>
                <span className="ov-track-code-label">Código de rastreio</span>
                <b>{order.trackingCode}</b>
              </div>
              <a className="btn btn-g" href={correiosLink(order.trackingCode)} target="_blank" rel="noopener">
                <ExternalLink size={16} /> Rastrear nos Correios
              </a>
            </div>
          ) : (
            <p className="ov-track-wait">
              <Truck size={15} /> Assim que despacharmos, o código de rastreio aparece aqui.
            </p>
          )}
        </div>

        <div className="ov-confirm-summary">{summary}</div>
        <div className="co-result-actions">
          <Link className="btn btn-g" href="/pedidos">Meus pedidos</Link>
          <Link className="cs-continue" href="/">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  // ---- Pagamento pendente / cancelado: retomar ----
  return (
    <div className="ov-grid">
      <div className="co-main">
        <div className={`ov-status ${status === "cancelled" ? "cancelled" : "pending"}`}>
          {status === "cancelled" ? <XCircle size={18} /> : <Clock size={18} />}
          {status === "cancelled"
            ? "Este pedido foi cancelado por falta de pagamento — você pode refazer abaixo."
            : "Pagamento pendente. Finalize abaixo para confirmar seu pedido."}
        </div>

        {order.number && <h2 className="ov-number">Pedido #{order.number}</h2>}
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        {!pix && (
          <div className="co-panel">
            <div className="pay-methods">
              <button className={`pay-method${payMethod === "pix" ? " on" : ""}`} onClick={() => setPayMethod("pix")}>
                <QrCode strokeWidth={1.8} /> <b>PIX</b> <span>Aprovação na hora</span>
              </button>
              <button className={`pay-method${payMethod === "card" ? " on" : ""}`} onClick={() => setPayMethod("card")}>
                <CreditCard strokeWidth={1.8} /> <b>Cartão de crédito</b> <span>Em até 12x · via Mercado Pago</span>
              </button>
            </div>

            {payMethod === "pix" && (
              <button className="co-next" onClick={gerarPix} disabled={loading}>
                {loading ? "Gerando PIX…" : "Gerar PIX"}
              </button>
            )}
            {payMethod === "card" && (
              <>
                <div className="mp-note">
                  <CreditCard size={16} strokeWidth={1.8} />
                  Você será levado ao <b>ambiente seguro do Mercado Pago</b> para pagar com cartão, em até 12x.
                </div>
                <button className="co-next" onClick={pagarCartao} disabled={loading}>
                  {loading ? "Abrindo checkout…" : "Pagar com Mercado Pago"} <ArrowRight size={18} strokeWidth={2.4} />
                </button>
              </>
            )}
          </div>
        )}

        {pix && (
          <div className="co-panel">
            <PixDisplay qrCode={pix.qrCode} qrCodeBase64={pix.qrCodeBase64} />
          </div>
        )}
      </div>

      <aside className="co-summary">
        <h3>Resumo do pedido</h3>
        {summary}
      </aside>
    </div>
  );
}
