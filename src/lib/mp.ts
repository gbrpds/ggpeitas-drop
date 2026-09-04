import { and, eq, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { orderConfirmedEmail } from "@/lib/email-templates";
import { baseUrl } from "@/lib/site-url";

const MP_BASE = "https://api.mercadopago.com";

type OrderItem = { name: string; qty: number; price: number };
type Customer = { name?: string; email?: string };

/**
 * Consulta o status de um pagamento no Mercado Pago e sincroniza o pedido.
 * Casa o pagamento pelo mpPaymentId (fluxo inline) OU pelo external_reference
 * = id do pedido (fluxo Checkout Pro, onde o payment id só existe após pagar).
 * Só tira o pedido de "pending" (approved/cancelled), evitando sobrescrever.
 */
export async function syncPaymentStatus(
  paymentId: string,
): Promise<{ status: string; externalReference: string | null }> {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const status = String(data.status ?? "unknown"); // approved | pending | cancelled | rejected
  const extRef = typeof data.external_reference === "string" ? data.external_reference : null;

  // casa por payment id (inline) ou por id do pedido (Checkout Pro)
  const match = extRef
    ? or(eq(orders.mpPaymentId, String(paymentId)), eq(orders.id, extRef))
    : eq(orders.mpPaymentId, String(paymentId));

  try {
    const db = getDb();
    if (status === "approved") {
      // pagamento confirmado tem prioridade — vale mesmo se já tinha expirado.
      // grava também o payment id (no Checkout Pro ele só é conhecido agora).
      const changed = await db
        .update(orders)
        .set({ status: "approved", mpPaymentId: String(paymentId) })
        .where(and(match, ne(orders.status, "approved")))
        .returning({
          id: orders.id,
          number: orders.number,
          items: orders.items,
          totalCents: orders.totalCents,
          discountCents: orders.discountCents,
          couponCents: orders.couponCents,
          couponCode: orders.couponCode,
          customer: orders.customer,
        });
      // envia a confirmação SÓ na transição (evita duplicar no polling/webhook)
      for (const o of changed) {
        const c = (o.customer as Customer) ?? {};
        if (!c.email) continue;
        const tpl = orderConfirmedEmail({
          number: o.number,
          items: (o.items as OrderItem[]) ?? [],
          totalCents: o.totalCents,
          discountCents: o.discountCents,
          couponCents: o.couponCents,
          couponCode: o.couponCode,
          customerName: c.name,
          orderUrl: `${baseUrl()}/pedido/${o.id}`,
        });
        await sendEmail({ to: c.email, subject: tpl.subject, html: tpl.html });
      }
    } else if (status === "cancelled" || status === "rejected") {
      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(and(match, eq(orders.status, "pending")));
    }
  } catch (e) {
    console.error("sync order status error", e);
  }
  return { status, externalReference: extRef };
}

type MpPreferenceItem = { title: string; quantity: number; unit_price: number };

/**
 * Cria uma preferência de Checkout Pro (o cliente é levado ao ambiente do
 * Mercado Pago). Retorna a URL de pagamento (init_point).
 */
export async function mpCreatePreference(pref: {
  items: MpPreferenceItem[];
  payer?: Record<string, unknown>;
  externalReference: string;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
  installments?: number;
}) {
  const body = {
    items: pref.items.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
      currency_id: "BRL",
    })),
    payer: pref.payer,
    external_reference: pref.externalReference,
    back_urls: pref.backUrls,
    auto_return: "approved",
    notification_url: pref.notificationUrl,
    statement_descriptor: "GGPEITAS",
    payment_methods: pref.installments ? { installments: pref.installments } : undefined,
  };

  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

type MpPayload = Record<string, unknown>;

/** Cria um pagamento no Mercado Pago (PIX ou cartão). */
export async function mpCreatePayment(body: MpPayload, idempotencyKey: string) {
  const res = await fetch(`${MP_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
