/** Templates de e-mail (HTML inline, compatível com clientes de e-mail). */

const GREEN = "#0f8a3d";
const INK = "#1c1c18";

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Layout base com cabeçalho/rodapé da marca. */
function layout(title: string, body: string): string {
  return `
  <div style="margin:0;padding:0;background:#f2f2ef;font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:center;padding:8px 0 18px;">
        <span style="display:inline-block;font-size:22px;font-weight:900;letter-spacing:.5px;color:${GREEN};">GG PEITAS</span>
        <div style="font-size:11px;color:#8a8a80;letter-spacing:2px;">CAMISAS PREMIUM</div>
      </div>
      <div style="background:#fff;border:1px solid #e4e4de;border-radius:14px;padding:26px 24px;">
        <h1 style="margin:0 0 14px;font-size:19px;color:${INK};">${title}</h1>
        ${body}
      </div>
      <p style="text-align:center;font-size:11px;color:#9a9a90;margin:18px 0 0;line-height:1.5;">
        GG Peitas · Camisas de futebol importadas<br/>
        Você recebeu este e-mail porque tem cadastro ou fez um pedido na nossa loja.
      </p>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;
    font-weight:700;font-size:14px;padding:12px 22px;border-radius:9px;">${label}</a>`;
}

type OrderItem = { name: string; qty: number; price: number };

function itemsTable(items: OrderItem[], totalCents: number): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;">${i.name} <span style="color:#8a8a80;">×${i.qty}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">${brl(Math.round(i.price * 100) * i.qty)}</td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${rows}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;">Total</td>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;text-align:right;color:${GREEN};">${brl(totalCents)}</td>
      </tr>
    </table>`;
}

/** Boas-vindas ao criar conta. */
export function welcomeEmail(name: string, siteUrl: string) {
  const first = name?.split(" ")[0] || "torcedor";
  return {
    subject: "Bem-vindo à GG Peitas! ⚽",
    html: layout(
      `Olá, ${first}! Seja bem-vindo 💚`,
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Sua conta foi criada com sucesso. Agora você pode acompanhar seus pedidos,
        salvar seu time do coração e finalizar suas compras mais rápido.
      </p>
      <p style="margin:20px 0 6px;">${button(siteUrl, "Ver camisas")}</p>`,
    ),
  };
}

/** Confirmação de pedido pago. */
export function orderConfirmedEmail(order: {
  number: string | null;
  items: OrderItem[];
  totalCents: number;
  customerName?: string;
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor";
  return {
    subject: `Pagamento confirmado — Pedido #${order.number ?? ""} 💚`,
    html: layout(
      "Pagamento confirmado!",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Oba, ${first}! Recebemos o pagamento do seu pedido
        <b>#${order.number ?? ""}</b>. Já estamos preparando tudo para o envio.
      </p>
      ${itemsTable(order.items, order.totalCents)}
      <p style="margin:20px 0 6px;">${button(order.orderUrl, "Acompanhar pedido")}</p>
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        Assim que despacharmos, você recebe o código de rastreio por aqui.
      </p>`,
    ),
  };
}

/** Aviso de envio com código de rastreio. */
export function orderShippedEmail(order: {
  number: string | null;
  customerName?: string;
  trackingCode: string;
  trackingUrl: string;
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor";
  return {
    subject: `Seu pedido #${order.number ?? ""} foi enviado! 📦`,
    html: layout(
      "Seu pedido está a caminho 📦",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        ${first}, boa notícia! O pedido <b>#${order.number ?? ""}</b> foi despachado.
      </p>
      <div style="background:#f6f6f3;border:1px solid #e4e4de;border-radius:10px;padding:14px 16px;margin:14px 0;">
        <div style="font-size:12px;color:#8a8a80;">Código de rastreio</div>
        <div style="font-size:17px;font-weight:800;letter-spacing:1px;">${order.trackingCode}</div>
      </div>
      <p style="margin:8px 0 6px;">${button(order.trackingUrl, "Rastrear nos Correios")}</p>
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        Você também pode acompanhar em <a href="${order.orderUrl}" style="color:${GREEN};">seu pedido</a>.
      </p>`,
    ),
  };
}
