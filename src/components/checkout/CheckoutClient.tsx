"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Truck, CreditCard, QrCode, Check, Copy, ArrowRight, ArrowLeft, ShoppingBag, Clock, XCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { Jersey } from "@/components/Jersey";
import { CardPaymentBrick } from "./CardPaymentBrick";

type Customer = { name: string; cpf: string; email: string; phone: string };
type Shipping = { cep: string; rua: string; numero: string; bairro: string; cidade: string; uf: string };

const STEPS = [
  { n: 1, label: "Seus dados", Icon: User },
  { n: 2, label: "Entrega", Icon: Truck },
  { n: 3, label: "Pagamento", Icon: CreditCard },
];

export function CheckoutClient() {
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer>({ name: "", cpf: "", email: "", phone: "" });
  const [shipping, setShipping] = useState<Shipping>({ cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "" });
  const [payMethod, setPayMethod] = useState<"pix" | "card" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [pix, setPix] = useState<{ qrCodeBase64?: string; qrCode?: string; number?: string; paymentId?: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ status: string; number?: string } | null>(null);

  // Contador de 5 min + verificação do pagamento PIX
  useEffect(() => {
    if (!pix?.paymentId || expired || result) return;
    const started = Date.now();
    const tick = setInterval(() => {
      const left = 300 - Math.floor((Date.now() - started) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(tick);
        clearInterval(poll);
        setExpired(true);
        fetch("/api/checkout/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: pix.paymentId }),
        }).catch(() => {});
      }
    }, 1000);
    const poll = setInterval(async () => {
      try {
        const s = await fetch(`/api/checkout/status?paymentId=${pix.paymentId}`).then((r) => r.json());
        if (s.status === "approved") {
          clearInterval(tick);
          clearInterval(poll);
          setResult({ status: "approved", number: pix.number });
        } else if (s.status === "cancelled" || s.status === "rejected") {
          clearInterval(tick);
          clearInterval(poll);
          setExpired(true);
        }
      } catch {
        /* ignora */
      }
    }, 5000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [pix?.paymentId, pix?.number, expired, result]);

  // pré-preenche com a sessão
  useEffect(() => {
    if (session?.user) {
      setCustomer((c) => ({
        ...c,
        name: c.name || session.user?.name || "",
        email: c.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const orderPayload = () => ({
    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    customer,
    shipping,
  });

  async function lookupCep(raw: string) {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const d = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((r) => r.json());
      if (!d.erro) {
        setShipping((s) => ({
          ...s,
          rua: d.logradouro || s.rua,
          bairro: d.bairro || s.bairro,
          cidade: d.localidade || s.cidade,
          uf: d.uf || s.uf,
        }));
      }
    } catch {
      /* silencioso */
    } finally {
      setCepLoading(false);
    }
  }

  function validateStep1() {
    if (customer.name.trim().length < 3) return "Informe seu nome completo.";
    if (customer.cpf.replace(/\D/g, "").length !== 11) return "CPF inválido.";
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) return "E-mail inválido.";
    if (customer.phone.replace(/\D/g, "").length < 10) return "Telefone inválido (com DDD).";
    return null;
  }
  function validateStep2() {
    if (shipping.cep.replace(/\D/g, "").length !== 8) return "CEP inválido.";
    if (!shipping.rua) return "Informe a rua.";
    if (!shipping.numero) return "Informe o número.";
    if (!shipping.bairro) return "Informe o bairro.";
    if (!shipping.cidade || !shipping.uf) return "Informe cidade e estado.";
    return null;
  }

  function next() {
    setError(null);
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) return setError(err);
    setStep((s) => Math.min(3, s + 1));
  }

  async function gerarPix() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar o PIX.");
      } else {
        clear(); // pedido gerado → esvazia o carrinho
        setSecondsLeft(300);
        setExpired(false);
        setPix({
          qrCodeBase64: data.qrCodeBase64,
          qrCode: data.qrCode,
          number: data.number,
          paymentId: String(data.paymentId),
        });
      }
    } catch {
      setError("Falha de conexão ao gerar o PIX.");
    } finally {
      setLoading(false);
    }
  }

  async function pagarCartao(formData: any) {
    setError(null);
    const res = await fetch("/api/checkout/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...orderPayload(),
        payment: {
          token: formData.token,
          payment_method_id: formData.payment_method_id,
          issuer_id: formData.issuer_id,
          installments: Number(formData.installments),
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Pagamento não aprovado.");
      throw new Error("card failed");
    }
    setResult({ status: data.status, number: data.number });
    if (data.status === "approved") clear();
  }

  if (!mounted) return <div className="cart-empty">Carregando…</div>;

  // Resultado de cartão aprovado / em análise / recusado
  if (result) {
    const ok = result.status === "approved";
    const analise = result.status === "in_process" || result.status === "pending";
    return (
      <div className="co-result">
        <div className={`co-result-icon ${ok ? "ok" : analise ? "wait" : "fail"}`}>
          <Check strokeWidth={3} />
        </div>
        <h2>{ok ? "Pagamento aprovado!" : analise ? "Pagamento em análise" : "Pagamento recusado"}</h2>
        <p>
          {ok
            ? "Recebemos seu pedido — em breve você recebe a confirmação por e-mail. 💚"
            : analise
              ? "Assim que for aprovado, você recebe a confirmação por e-mail."
              : "Tente outro cartão ou volte e escolha PIX."}
        </p>
        {result.number && <div className="co-order-num">Pedido <b>#{result.number}</b></div>}
        <div className="co-result-actions">
          <Link className="btn btn-g" href="/pedidos">Meus pedidos</Link>
          <Link className="cs-continue" href="/">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  // Tela do PIX (com contador de 5 min)
  if (pix) {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    if (expired) {
      return (
        <div className="co-result">
          <div className="co-result-icon fail"><XCircle strokeWidth={2.5} /></div>
          <h2>PIX expirado</h2>
          {pix.number && <div className="co-order-num">Pedido <b>#{pix.number}</b> · cancelado</div>}
          <p>O tempo para pagamento acabou e o pedido foi cancelado. É só refazer a compra quando quiser.</p>
          <div className="co-result-actions">
            <Link className="btn btn-g" href="/">Voltar à loja</Link>
            <Link className="cs-continue" href="/pedidos">Meus pedidos</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="pix-view">
        {pix.number && <div className="pix-order">Pedido <b>#{pix.number}</b></div>}
        <div className={`pix-timer${secondsLeft <= 60 ? " urgent" : ""}`}>
          <Clock size={18} /> Faltam <b>{mm}:{ss}</b> para o pagamento expirar
        </div>
        <div className="pix-box">
          <h3>Escaneie o QR Code para pagar</h3>
          {pix.qrCodeBase64 && <img className="pix-qr" src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code PIX" />}
          <p className="pix-label">Ou copie o código PIX:</p>
          <div className="pix-code">
            <input readOnly value={pix.qrCode ?? ""} />
            <button
              onClick={() => {
                if (pix.qrCode) {
                  navigator.clipboard.writeText(pix.qrCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }
              }}
              aria-label="Copiar"
            >
              <Copy size={16} /> {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="pix-note">Assim que o pagamento for identificado, seu pedido é confirmado automaticamente.</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag strokeWidth={1.5} />
        <h2>Seu carrinho está vazio</h2>
        <Link className="btn btn-g" href="/">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="co-grid">
      <div className="co-main">
        {/* stepper */}
        <div className="co-steps">
          {STEPS.map(({ n, label, Icon }) => (
            <div key={n} className={`co-step${step === n ? " active" : ""}${step > n ? " done" : ""}`}>
              <span className="co-step-badge">{step > n ? <Check size={15} strokeWidth={3} /> : <Icon size={16} />}</span>
              <span className="co-step-label">{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Etapa 1 */}
        {step === 1 && (
          <div className="co-panel">
            <h2>Seus dados</h2>
            <div className="co-field">
              <label>Nome completo</label>
              <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Seu nome completo" />
            </div>
            <div className="co-row">
              <div className="co-field">
                <label>CPF</label>
                <input value={customer.cpf} onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })} placeholder="000.000.000-00" inputMode="numeric" />
              </div>
              <div className="co-field">
                <label>Telefone (WhatsApp)</label>
                <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="(00) 00000-0000" inputMode="tel" />
              </div>
            </div>
            <div className="co-field">
              <label>E-mail</label>
              <input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="voce@email.com" inputMode="email" />
            </div>
            <button className="co-next" onClick={next}>Continuar <ArrowRight size={18} strokeWidth={2.4} /></button>
          </div>
        )}

        {/* Etapa 2 */}
        {step === 2 && (
          <div className="co-panel">
            <h2>Endereço de entrega</h2>
            <div className="co-row">
              <div className="co-field">
                <label>CEP {cepLoading && <span className="co-hint">buscando…</span>}</label>
                <input value={shipping.cep} onChange={(e) => { const v = e.target.value; setShipping({ ...shipping, cep: v }); lookupCep(v); }} placeholder="00000-000" inputMode="numeric" />
              </div>
              <div className="co-field">
                <label>Número</label>
                <input value={shipping.numero} onChange={(e) => setShipping({ ...shipping, numero: e.target.value })} placeholder="123" inputMode="numeric" />
              </div>
            </div>
            <div className="co-field">
              <label>Rua</label>
              <input value={shipping.rua} onChange={(e) => setShipping({ ...shipping, rua: e.target.value })} placeholder="Preenchido pelo CEP" />
            </div>
            <div className="co-field">
              <label>Bairro</label>
              <input value={shipping.bairro} onChange={(e) => setShipping({ ...shipping, bairro: e.target.value })} placeholder="Preenchido pelo CEP" />
            </div>
            <div className="co-row">
              <div className="co-field">
                <label>Cidade</label>
                <input value={shipping.cidade} onChange={(e) => setShipping({ ...shipping, cidade: e.target.value })} />
              </div>
              <div className="co-field co-uf">
                <label>UF</label>
                <input value={shipping.uf} maxLength={2} onChange={(e) => setShipping({ ...shipping, uf: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="co-nav">
              <button className="co-back" onClick={() => setStep(1)}><ArrowLeft size={17} /> Voltar</button>
              <button className="co-next" onClick={next}>Continuar <ArrowRight size={18} strokeWidth={2.4} /></button>
            </div>
          </div>
        )}

        {/* Etapa 3 */}
        {step === 3 && (
          <div className="co-panel">
            <h2>Pagamento</h2>

            {!pix && (
              <div className="pay-methods">
                <button className={`pay-method${payMethod === "pix" ? " on" : ""}`} onClick={() => setPayMethod("pix")}>
                  <QrCode strokeWidth={1.8} /> <b>PIX</b> <span>Aprovação na hora · 1% OFF</span>
                </button>
                <button className={`pay-method${payMethod === "card" ? " on" : ""}`} onClick={() => setPayMethod("card")}>
                  <CreditCard strokeWidth={1.8} /> <b>Cartão de crédito</b> <span>Em até 12x</span>
                </button>
              </div>
            )}

            {payMethod === "pix" && (
              <button className="co-next" onClick={gerarPix} disabled={loading}>
                {loading ? "Gerando PIX…" : "Gerar PIX"}
              </button>
            )}

            {payMethod === "card" && (
              <div className="card-brick">
                <CardPaymentBrick amount={total} onPay={pagarCartao} />
              </div>
            )}

            <div className="co-nav">
              <button className="co-back" onClick={() => setStep(2)}><ArrowLeft size={17} /> Voltar</button>
            </div>
          </div>
        )}
      </div>

      {/* Resumo */}
      <aside className="co-summary">
        <h3>Resumo do pedido</h3>
        <div className="co-items">
          {items.map((i) => (
            <div className="co-item" key={i.id}>
              <div className="co-item-media"><Jersey colors={i.colors} /></div>
              <div className="co-item-info">
                <span className="co-item-name">{i.name}</span>
                <span className="co-item-qty">{i.qty} × {brl(i.price)}</span>
              </div>
              <b>{brl(i.price * i.qty)}</b>
            </div>
          ))}
        </div>
        <div className="cs-line"><span>Frete</span><b className="free">Grátis</b></div>
        <div className="cs-total"><span>Total</span><b>{brl(total)}</b></div>
      </aside>
    </div>
  );
}
