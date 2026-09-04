import { ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react";

const BADGES = [
  { Icon: ShieldCheck, title: "Compra 100% segura", sub: "Site protegido e pagamento via Mercado Pago" },
  { Icon: Truck, title: "Envio para todo o Brasil", sub: "Frete grátis acima de R$ 299" },
  { Icon: RefreshCw, title: "Troca fácil", sub: "7 dias para trocar ou devolver" },
  { Icon: CreditCard, title: "Em até 12x", sub: "No cartão, ou 1% OFF no PIX" },
];

export function TrustBadges() {
  return (
    <section className="trust-badges wrap">
      {BADGES.map(({ Icon, title, sub }) => (
        <div className="trust-badge" key={title}>
          <Icon strokeWidth={1.7} />
          <div>
            <b>{title}</b>
            <span>{sub}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
