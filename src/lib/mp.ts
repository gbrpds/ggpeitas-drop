import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

const MP_BASE = "https://api.mercadopago.com";

/**
 * Consulta o status de um pagamento no Mercado Pago e sincroniza o pedido.
 * Só tira o pedido de "pending" (approved/cancelled), evitando sobrescrever.
 */
export async function syncPaymentStatus(paymentId: string): Promise<string> {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const status = String(data.status ?? "unknown"); // approved | pending | cancelled | rejected

  try {
    const db = getDb();
    if (status === "approved") {
      // pagamento confirmado tem prioridade — vale mesmo se já tinha expirado
      await db
        .update(orders)
        .set({ status: "approved" })
        .where(and(eq(orders.mpPaymentId, String(paymentId)), ne(orders.status, "approved")));
    } else if (status === "cancelled" || status === "rejected") {
      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(and(eq(orders.mpPaymentId, String(paymentId)), eq(orders.status, "pending")));
    }
  } catch (e) {
    console.error("sync order status error", e);
  }
  return status;
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

export type CheckoutItem = { id: string; name: string; price: number; qty: number };

/** Recalcula o total no servidor (não confia no valor vindo do cliente). */
export function serverTotal(items: CheckoutItem[]): number {
  const cents = items.reduce((s, i) => s + Math.round(i.price * 100) * i.qty, 0);
  return cents / 100;
}
