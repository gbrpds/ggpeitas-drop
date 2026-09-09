/** Templates de e-mail (HTML inline, compatível com clientes de e-mail). */

import { baseUrl } from "@/lib/site-url";

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
      <div style="background:${GREEN};border-radius:14px;padding:24px 16px;text-align:center;margin-bottom:16px;">
        <div style="display:inline-block;background:#111111;border-radius:16px;padding:12px 16px;box-shadow:0 4px 14px rgba(0,0,0,.25);">
          <img src="${baseUrl()}/logo.png" alt="GG Peitas" width="82"
            style="display:block;width:82px;max-width:82px;height:auto;border:0;outline:none;text-decoration:none;" />
        </div>
        <div style="font-size:11px;color:#dff0e6;letter-spacing:3px;margin-top:12px;font-weight:700;">CAMISAS PREMIUM</div>
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

function itemsTable(
  items: OrderItem[],
  totalCents: number,
  discountCents = 0,
  couponCents = 0,
  couponCode?: string | null,
  freightCents = 0,
): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;">${i.name} <span style="color:#8a8a80;">×${i.qty}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">${brl(Math.round(i.price * 100) * i.qty)}</td>
      </tr>`,
    )
    .join("");
  const discountRow =
    discountCents > 0
      ? `<tr>
        <td style="padding:8px 0 0;font-size:14px;color:${GREEN};">Leve 3, Pague 2</td>
        <td style="padding:8px 0 0;font-size:14px;text-align:right;color:${GREEN};">− ${brl(discountCents)}</td>
      </tr>`
      : "";
  const couponRow =
    couponCents > 0
      ? `<tr>
        <td style="padding:8px 0 0;font-size:14px;color:${GREEN};">Cupom ${couponCode ?? ""}</td>
        <td style="padding:8px 0 0;font-size:14px;text-align:right;color:${GREEN};">− ${brl(couponCents)}</td>
      </tr>`
      : "";
  const freightRow = `<tr>
        <td style="padding:8px 0 0;font-size:14px;">Frete</td>
        <td style="padding:8px 0 0;font-size:14px;text-align:right;">${freightCents > 0 ? brl(freightCents) : "Grátis"}</td>
      </tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${rows}
      ${discountRow}
      ${couponRow}
      ${freightRow}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;">Total</td>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;text-align:right;color:${GREEN};">${brl(totalCents)}</td>
      </tr>
    </table>`;
}

/** Código de verificação de e-mail (criação de conta). */
export function verificationCodeEmail(name: string, code: string) {
  const first = name?.split(" ")[0] || "torcedor(a)";
  return {
    subject: `Seu código de verificação: ${code}`,
    html: layout(
      "Confirme seu e-mail",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Olá, ${first}! Use o código abaixo para concluir a criação da sua conta na GG Peitas.
      </p>
      <div style="text-align:center;margin:22px 0;">
        <span style="display:inline-block;font-family:monospace;font-size:32px;font-weight:800;letter-spacing:8px;
          color:${INK};background:#f6f6f3;border:1px solid #e4e4de;border-radius:12px;padding:14px 22px;">${code}</span>
      </div>
      <p style="font-size:13px;color:#8a8a80;">
        O código expira em 15 minutos. Se você não tentou criar uma conta, ignore este e-mail.
      </p>`,
    ),
  };
}

/** Redefinição de senha ("esqueci a senha"). */
export function passwordResetEmail(name: string, resetUrl: string) {
  const first = name?.split(" ")[0] || "torcedor(a)";
  return {
    subject: "Redefinição de senha — GG Peitas",
    html: layout(
      "Redefinir sua senha",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Olá, ${first}! Recebemos um pedido para redefinir a senha da sua conta.
        Clique no botão abaixo para criar uma nova senha.
      </p>
      <p style="margin:22px 0 10px;">${button(resetUrl, "Trocar a senha")}</p>
      <p style="font-size:12px;color:#8a8a80;line-height:1.6;">
        Se o botão não funcionar, clique aqui ou copie e cole este link no navegador:<br/>
        <a href="${resetUrl}" style="color:${GREEN};word-break:break-all;">${resetUrl}</a>
      </p>
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        O link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.
      </p>`,
    ),
  };
}

/** Boas-vindas ao criar conta. */
export function welcomeEmail(name: string, siteUrl: string) {
  const first = name?.split(" ")[0] || "torcedor(a)";
  return {
    subject: "Bem-vindo(a) à GG Peitas!",
    html: layout(
      `Olá, ${first}! Seja bem-vindo(a)`,
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
  discountCents?: number;
  couponCents?: number;
  couponCode?: string | null;
  freightCents?: number;
  customerName?: string;
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  return {
    subject: `Pagamento confirmado — Pedido #${order.number ?? ""}`,
    html: layout(
      "Pagamento confirmado!",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Oba, ${first}! Recebemos o pagamento do seu pedido
        <b>#${order.number ?? ""}</b>. Já estamos preparando tudo para o envio.
      </p>
      ${itemsTable(order.items, order.totalCents, order.discountCents ?? 0, order.couponCents ?? 0, order.couponCode, order.freightCents ?? 0)}
      <p style="margin:20px 0 6px;">${button(order.orderUrl, "Acompanhar pedido")}</p>
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        Assim que despacharmos, você recebe o código de rastreio por aqui.
      </p>`,
    ),
  };
}

/** Pedido gerado — aguardando pagamento. */
export function orderPendingEmail(order: {
  number: string | null;
  items: OrderItem[];
  totalCents: number;
  discountCents?: number;
  couponCents?: number;
  couponCode?: string | null;
  freightCents?: number;
  customerName?: string;
  paymentMethod?: string;
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  const metodo =
    order.paymentMethod === "pix"
      ? "via PIX"
      : order.paymentMethod === "boleto"
        ? "via boleto"
        : order.paymentMethod === "card"
          ? "no cartão"
          : "";
  return {
    subject: `Pedido #${order.number ?? ""} gerado — aguardando pagamento`,
    html: layout(
      "Recebemos seu pedido!",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        Olá, ${first}! Seu pedido <b>#${order.number ?? ""}</b> foi gerado e está
        <b>pendente de pagamento</b> ${metodo}. Assim que o pagamento for confirmado,
        avisamos você por e-mail e começamos a preparar o envio.
      </p>
      ${itemsTable(order.items, order.totalCents, order.discountCents ?? 0, order.couponCents ?? 0, order.couponCode, order.freightCents ?? 0)}
      <p style="margin:20px 0 6px;">${button(order.orderUrl, "Finalizar pagamento")}</p>
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        Se você já pagou, pode ignorar este aviso — a confirmação chega em instantes.
      </p>`,
    ),
  };
}

/** Pedido cancelado (pagamento não confirmado no prazo, ou recusado). */
export function orderCancelledEmail(order: {
  number: string | null;
  customerName?: string;
  siteUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  return {
    subject: `Pedido #${order.number ?? ""} cancelado`,
    html: layout(
      "Seu pedido foi cancelado",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        ${first}, o pedido <b>#${order.number ?? ""}</b> foi cancelado porque o pagamento
        não foi confirmado dentro do prazo. Não se preocupe — nenhum valor foi cobrado.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#444;">
        Se ainda quiser a sua camisa, é só fazer um novo pedido.
      </p>
      <p style="margin:20px 0 6px;">${button(order.siteUrl, "Fazer novo pedido")}</p>`,
    ),
  };
}

/** Atualização de etapa do envio (preparando / entregue). */
export function orderStageEmail(order: {
  number: string | null;
  customerName?: string;
  stage: "preparando" | "entregue";
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  const copy =
    order.stage === "preparando"
      ? {
          subject: `Pedido #${order.number ?? ""} em preparação`,
          title: "Estamos preparando seu pedido",
          text: `${first}, seu pedido <b>#${order.number ?? ""}</b> entrou em preparação. Em breve ele será despachado e você recebe o código de rastreio por aqui.`,
        }
      : {
          subject: `Pedido #${order.number ?? ""} entregue`,
          title: "Seu pedido foi entregue!",
          text: `${first}, seu pedido <b>#${order.number ?? ""}</b> consta como <b>entregue</b>. Esperamos que você aproveite muito a sua camisa! Qualquer coisa, é só responder este e-mail.`,
        };
  return {
    subject: copy.subject,
    html: layout(
      copy.title,
      `<p style="font-size:14px;line-height:1.6;color:#444;">${copy.text}</p>
      <p style="margin:20px 0 6px;">${button(order.orderUrl, "Acompanhar pedido")}</p>`,
    ),
  };
}

/** Pedido entregue — pede feedback ao cliente. */
export function feedbackRequestEmail(order: {
  number: string | null;
  customerName?: string;
  feedbackUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  return {
    subject: `Seu pedido #${order.number ?? ""} chegou! Conte como foi`,
    html: layout(
      "Seu pedido foi entregue!",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        ${first}, que bom que seu pedido <b>#${order.number ?? ""}</b> chegou!
        Sua opinião ajuda demais outros torcedores e a gente a melhorar sempre.
        Leva menos de um minuto:
      </p>
      <p style="margin:22px 0 6px;">${button(order.feedbackUrl, "Deixar meu feedback")}</p>
      <p style="font-size:12px;color:#8a8a80;line-height:1.6;">
        Se o botão não funcionar, copie e cole este link no navegador:<br/>
        <a href="${order.feedbackUrl}" style="color:${GREEN};word-break:break-all;">${order.feedbackUrl}</a>
      </p>`,
    ),
  };
}

/** Aviso de "voltou ao estoque". */
export function backInStockEmail(opts: { productName: string; productUrl: string }) {
  return {
    subject: `Voltou! ${opts.productName} disponível de novo`,
    html: layout(
      "Voltou ao estoque!",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        A camisa que você queria — <b>${opts.productName}</b> — está disponível de novo na GG Peitas.
        Corre que pode acabar rápido!
      </p>
      <p style="margin:20px 0 6px;">${button(opts.productUrl, "Comprar agora")}</p>`,
    ),
  };
}

/** Aviso de envio (com código de rastreio, quando houver). */
export function orderShippedEmail(order: {
  number: string | null;
  customerName?: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  orderUrl: string;
}) {
  const first = order.customerName?.split(" ")[0] || "torcedor(a)";
  const trackingBlock =
    order.trackingCode
      ? `<div style="background:#f6f6f3;border:1px solid #e4e4de;border-radius:10px;padding:14px 16px;margin:14px 0;">
        <div style="font-size:12px;color:#8a8a80;">Código de rastreio</div>
        <div style="font-size:17px;font-weight:800;letter-spacing:1px;">${order.trackingCode}</div>
      </div>
      ${order.trackingUrl ? `<p style="margin:8px 0 6px;">${button(order.trackingUrl, "Rastrear nos Correios")}</p>` : ""}
      <p style="font-size:13px;color:#8a8a80;margin-top:14px;">
        Você também pode acompanhar em <a href="${order.orderUrl}" style="color:${GREEN};">seu pedido</a>.
      </p>`
      : `<p style="font-size:14px;line-height:1.6;color:#444;">
        Assim que o código de rastreio estiver disponível, você recebe por aqui.
      </p>
      <p style="margin:16px 0 6px;">${button(order.orderUrl, "Acompanhar pedido")}</p>`;
  return {
    subject: `Seu pedido #${order.number ?? ""} foi enviado!`,
    html: layout(
      "Seu pedido está a caminho",
      `<p style="font-size:14px;line-height:1.6;color:#444;">
        ${first}, boa notícia! O pedido <b>#${order.number ?? ""}</b> foi despachado.
      </p>
      ${trackingBlock}`,
    ),
  };
}
