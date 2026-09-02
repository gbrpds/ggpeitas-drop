import { ShieldCheck, Truck, MessageCircle, RefreshCcw } from "lucide-react";

const items = [
  { Icon: ShieldCheck, title: "Compra Segura", sub: "Ambiente protegido para pagamentos online" },
  { Icon: Truck, title: "Frete Grátis", sub: "Envio rápido e grátis para todo o Brasil" },
  { Icon: MessageCircle, title: "Suporte Rápido", sub: "Atendimento no WhatsApp a semana toda" },
  { Icon: RefreshCcw, title: "Satisfação garantida", sub: "Troca ou reembolso em até 7 dias" },
];

export function FooterTrust() {
  return (
    <div className="ftrust">
      <div className="wrap">
        {items.map(({ Icon, title, sub }) => (
          <div className="it" key={title}>
            <Icon strokeWidth={1.6} />
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
