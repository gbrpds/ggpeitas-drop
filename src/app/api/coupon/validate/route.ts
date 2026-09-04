import { NextResponse } from "next/server";
import { z } from "zod";
import { priceOrder, PricingError } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";
import { itemSchema } from "@/lib/checkout-schema";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  code: z.string().min(1).max(40),
});

/** Valida um cupom para o carrinho atual e devolve o desconto/total (só p/ exibir). */
export async function POST(req: Request) {
  const rl = await rateLimit(`coupon:${clientIp(req)}`, 20, 600);
  if (!rl.ok) return tooMany("Muitas tentativas de cupom. Aguarde um pouco.");

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });

  let netCents: number;
  try {
    const priced = await priceOrder(parsed.data.items); // preço real + Leve 3 Pague 2
    netCents = priced.totalCents;
  } catch (e) {
    const msg = e instanceof PricingError ? e.message : "Não foi possível validar o pedido.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const result = await validateCoupon(parsed.data.code, netCents);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error });

  return NextResponse.json({
    ok: true,
    code: result.code,
    discountCents: result.discountCents,
    totalCents: netCents - result.discountCents,
  });
}
