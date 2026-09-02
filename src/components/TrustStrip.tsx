import { Truck, CreditCard, ShieldCheck, RefreshCcw } from "lucide-react";

const items = [
  { Icon: Truck, title: "Frete grátis*", sub: "Para todo o Brasil" },
  { Icon: CreditCard, title: "Em até 3x sem juros", sub: "Pix, cartão e boleto" },
  { Icon: ShieldCheck, title: "Compra segura", sub: "Mercado Pago" },
  { Icon: RefreshCcw, title: "Troca fácil", sub: "7 dias garantidos" },
];

export function TrustStrip() {
  return (
    <div className="strip">
      <div className="wrap">
        {items.map(({ Icon, title, sub }) => (
          <div className="it" key={title}>
            <Icon strokeWidth={1.8} />
            <div>
              <b>{title}</b>
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
