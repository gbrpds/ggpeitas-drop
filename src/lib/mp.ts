const MP_BASE = "https://api.mercadopago.com";

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
