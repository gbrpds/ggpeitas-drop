import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons, orders } from "@/db/schema";

export type CouponResult =
  | { ok: true; code: string; type: "percent" | "fixed"; value: number; discountCents: number }
  | { ok: false; error: string };

/**
 * Valida um cupom e calcula o desconto sobre `baseCents` (total já líquido,
 * após "Leve 3, Pague 2"). Tudo no servidor — nunca confia no cliente.
 * Usos são contados pelos pedidos APROVADOS com o mesmo código.
 */
export async function validateCoupon(rawCode: string, baseCents: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Informe um cupom." };

  try {
    const db = getDb();
    const [c] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    if (!c || !c.active) return { ok: false, error: "Cupom inválido." };
    if (c.expiresAt && c.expiresAt.getTime() < Date.now()) {
      return { ok: false, error: "Cupom expirado." };
    }
    if (baseCents < c.minCents) {
      const min = (c.minCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      return { ok: false, error: `Pedido mínimo de ${min} para este cupom.` };
    }
    if (c.maxUses != null) {
      const [{ n }] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(eq(orders.couponCode, code), eq(orders.status, "approved")));
      if (n >= c.maxUses) return { ok: false, error: "Este cupom atingiu o limite de usos." };
    }

    // desconto: percentual ou valor fixo, nunca maior que o total
    let discountCents =
      c.type === "percent" ? Math.round((baseCents * c.value) / 100) : c.value;
    discountCents = Math.max(0, Math.min(discountCents, baseCents));

    return { ok: true, code, type: c.type as "percent" | "fixed", value: c.value, discountCents };
  } catch (e) {
    console.error("validateCoupon error", e);
    return { ok: false, error: "Não foi possível validar o cupom." };
  }
}
