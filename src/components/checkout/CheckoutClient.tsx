"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Truck, CreditCard, QrCode, Check, ArrowRight, ArrowLeft, ShoppingBag, Barcode } from "lucide-react";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { Jersey } from "@/components/Jersey";
import { PROMO_TITLE } from "@/lib/promo";
import { FreteCalc } from "@/components/FreteCalc";
import { PixDisplay } from "./PixDisplay";

type Customer = { name: string; cpf: string; email: string; phone: string };
type Shipping = { cep: string; rua: string; numero: string; bairro: string; cidade: string; uf: string };
type Quote = {
  subtotalCents: number;
  discountCents: number;
  coupon: { code: string; discountCents: number } | null;
  couponError?: string;
  freightCents: number | null;
  freeShipping: boolean;
  totalCents: number;
};

const STEPS = [
  { n: 1, label: "Seus dados", Icon: User },
  { n: 2, label: "Entrega", Icon: Truck },
  { n: 3, label: "Pagamento", Icon: CreditCard },
];

export function CheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer>({ name: "", cpf: "", email: "", phone: "" });
  const [shipping, setShipping] = useState<Shipping>({ cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "" });
  const [payMethod, setPayMethod] = useState<"pix" | "card" | "boleto" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [pix, setPix] = useState<{ qrCodeBase64?: string; qrCode?: string; number?: string; paymentId?: string; orderId?: string } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (session?.user) {
      setCustomer((c) => ({
        ...c,
        name: c.name || session.user?.name || "",
        email: c.email || session.user?.email || "",
      }));
    }
  }, [session]);

  // Aguarda a confirmação do PIX; ao aprovar, vai para a página do pedido
  useEffect(() => {
    if (!pix?.paymentId) return;
    const poll = setInterval(async () => {
      try {
        const s = await fetch(`/api/checkout/status?paymentId=${pix.paymentId}`).then((r) => r.json());
        if (s.status === "approved" && pix.orderId) {
          clearInterval(poll);
          router.push(`/pedido/${pix.orderId}`);
        }
      } catch {
        /* ignora */
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [pix?.paymentId, pix?.orderId, router]);

  const itemsPayload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        size: i.size,
        version: i.version,
        customName: i.customName,
        customNumber: i.customNumber,
      })),
    [items],
  );

  // Cotação no SERVIDOR (fonte da verdade): promo + cupom + frete + total.
  const uf = shipping.uf?.trim().toUpperCase();
  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    let ok = true;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: itemsPayload, couponCode: appliedCode ?? undefined, uf }),
        });
        const data = await res.json();
        if (!ok) return;
        if (data.ok) {
          setQuote(data as Quote);
          if (appliedCode && data.couponError) {
            setCouponMsg(data.couponError);
            setAppliedCode(null);
          } else if (data.coupon) {
            setCouponMsg(null);
          }
        }
      } catch {
        /* mantém a cotação anterior */
      }
    }, 350);
    return () => {
      ok = false;
      clearTimeout(t);
    };
  }, [itemsPayload, appliedCode, uf]);

  // valores exibidos (da cotação; fallback simples enquanto carrega)
  const clientSubtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotal = quote ? quote.subtotalCents / 100 : clientSubtotal;
  const discount = quote ? quote.discountCents / 100 : 0;
  const coupon = quote?.coupon ?? null;
  const couponValue = coupon ? coupon.discountCents / 100 : 0;
  const freeShip = quote?.freeShipping ?? false;
  const freightValue = quote ? (quote.freightCents == null ? null : quote.freightCents / 100) : null;
  const total = subtotal - discount; // pós Leve 3, Pague 2
  const finalTotal = quote ? quote.totalCents / 100 : clientSubtotal;

  const orderPayload = () => ({
    items: itemsPayload, // o servidor recalcula o preço real
    customer,
    shipping,
    couponCode: appliedCode ?? undefined,
  });

  function aplicarCupom() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponMsg(null);
    setAppliedCode(code); // a cotação valida e reflete no resumo
  }

  function removerCupom() {
    setAppliedCode(null);
    setCouponInput("");
    setCouponMsg(null);
  }

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
        setPix({
          qrCodeBase64: data.qrCodeBase64,
          qrCode: data.qrCode,
          number: data.number,
          paymentId: String(data.paymentId),
          orderId: data.orderId,
        });
      }
    } catch {
      setError("Falha de conexão ao gerar o PIX.");
    } finally {
      setLoading(false);
    }
  }

  async function pagarMercadoPago(method: "card" | "boleto") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload(), method }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) {
        setError(data.error ?? "Não foi possível abrir o checkout do Mercado Pago.");
        return;
      }
      clear(); // pedido já registrado (pendente) → esvazia o carrinho
      window.location.href = data.initPoint; // vai para o ambiente do Mercado Pago
    } catch {
      setError("Falha de conexão ao abrir o checkout.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return <div className="cart-empty">Carregando…</div>;

  // Tela do PIX (sem timer — a expiração é tratada no servidor em 15 min)
  if (pix) {
    return (
      <div className="pix-view">
        {pix.number && <div className="pix-order">Pedido <b>#{pix.number}</b></div>}
        <PixDisplay qrCode={pix.qrCode} qrCodeBase64={pix.qrCodeBase64} />
        <div className="co-result-actions" style={{ marginTop: 18 }}>
          <Link className="cs-continue" href="/pedidos">Ver em Meus pedidos</Link>
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
        <div className="co-steps">
          {STEPS.map(({ n, label, Icon }) => (
            <div key={n} className={`co-step${step === n ? " active" : ""}${step > n ? " done" : ""}`}>
              <span className="co-step-badge">{step > n ? <Check size={15} strokeWidth={3} /> : <Icon size={16} />}</span>
              <span className="co-step-label">{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

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
            {uf && uf.length === 2 && (
              freeShip ? (
                <div className="co-frete-box ok">
                  <Truck size={18} /> <b>Frete grátis!</b> Seu pedido ultrapassou {brl(299)}.
                </div>
              ) : freightValue != null ? (
                <div className="co-frete-box">
                  <Truck size={18} />
                  <span>Frete para <b>{uf}</b>: <b>{brl(freightValue)}</b></span>
                  <small>Faltam {brl(Math.max(0, 299 - total))} para o frete grátis</small>
                </div>
              ) : null
            )}

            <div className="co-nav">
              <button className="co-back" onClick={() => setStep(1)}><ArrowLeft size={17} /> Voltar</button>
              <button className="co-next" onClick={next}>Continuar <ArrowRight size={18} strokeWidth={2.4} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="co-panel">
            <h2>Pagamento</h2>
            <div className="pay-methods">
              <button className={`pay-method${payMethod === "pix" ? " on" : ""}`} onClick={() => setPayMethod("pix")}>
                <QrCode strokeWidth={1.8} /> <b>PIX</b> <span>Aprovação na hora · 1% OFF</span>
              </button>
              <button className={`pay-method${payMethod === "card" ? " on" : ""}`} onClick={() => setPayMethod("card")}>
                <CreditCard strokeWidth={1.8} /> <b>Cartão de crédito</b> <span>Em até 12x · via Mercado Pago</span>
              </button>
              <button className={`pay-method${payMethod === "boleto" ? " on" : ""}`} onClick={() => setPayMethod("boleto")}>
                <Barcode strokeWidth={1.8} /> <b>Boleto bancário</b> <span>Compensa em 1 a 3 dias úteis</span>
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
                  Você será levado ao <b>ambiente seguro do Mercado Pago</b> para pagar com cartão
                  (crédito ou débito), em até 12x. Após o pagamento você volta para acompanhar o pedido.
                </div>
                <button className="co-next" onClick={() => pagarMercadoPago("card")} disabled={loading}>
                  {loading ? "Abrindo checkout…" : "Pagar com Mercado Pago"} <ArrowRight size={18} strokeWidth={2.4} />
                </button>
              </>
            )}
            {payMethod === "boleto" && (
              <>
                <div className="mp-note">
                  <Barcode size={16} strokeWidth={1.8} />
                  Geramos o <b>boleto</b> no ambiente do Mercado Pago. A confirmação leva de
                  <b> 1 a 3 dias úteis</b> — seu pedido fica reservado até lá e é confirmado automaticamente.
                </div>
                <button className="co-next" onClick={() => pagarMercadoPago("boleto")} disabled={loading}>
                  {loading ? "Gerando boleto…" : "Gerar boleto"} <ArrowRight size={18} strokeWidth={2.4} />
                </button>
              </>
            )}

            <div className="co-nav">
              <button className="co-back" onClick={() => setStep(2)}><ArrowLeft size={17} /> Voltar</button>
            </div>
          </div>
        )}
      </div>

      <aside className="co-summary">
        <h3>Resumo do pedido</h3>
        <div className="co-items">
          {items.map((i) => (
            <div className="co-item" key={i.id}>
              <div className="co-item-media">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.name} />
                ) : (
                  <Jersey colors={i.colors} />
                )}
              </div>
              <div className="co-item-info">
                <span className="co-item-name">{i.name}</span>
                <span className="co-item-qty">{i.qty} × {brl(i.price)}</span>
              </div>
              <b>{brl(i.price * i.qty)}</b>
            </div>
          ))}
        </div>
        <div className="cs-line"><span>Subtotal</span><b>{brl(subtotal)}</b></div>
        {discount > 0 && (
          <div className="cs-line cd-promo"><span>{PROMO_TITLE}</span><b>− {brl(discount)}</b></div>
        )}
        {coupon && (
          <div className="cs-line cd-promo"><span>Cupom {coupon.code}</span><b>− {brl(couponValue)}</b></div>
        )}
        <div className="cs-line">
          <span>Frete</span>
          {freeShip ? (
            <b className="free">Grátis</b>
          ) : freightValue != null ? (
            <b>{brl(freightValue)}</b>
          ) : (
            <span className="cd-frete-right"><b>a calcular</b> <FreteCalc subtotal={total} /></span>
          )}
        </div>

        <div className="cs-coupon">
          {coupon ? (
            <div className="cs-coupon-applied">
              <span>Cupom <b>{coupon.code}</b> aplicado</span>
              <button type="button" onClick={removerCupom}>Remover</button>
            </div>
          ) : (
            <>
              <div className="cs-coupon-row">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  aria-label="Cupom de desconto"
                />
                <button type="button" onClick={aplicarCupom} disabled={!couponInput.trim()}>
                  Aplicar
                </button>
              </div>
              {couponMsg && <span className="cs-coupon-err">{couponMsg}</span>}
            </>
          )}
        </div>

        <div className="cs-total"><span>Total</span><b>{brl(finalTotal)}</b></div>
      </aside>
    </div>
  );
}
