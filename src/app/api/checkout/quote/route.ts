import { NextResponse } from "next/server";
import { z } from "zod";
import { priceOrder, PricingError } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";
import { freightCentsFor, FREE_SHIPPING_MIN } from "@/lib/shipping";
import { itemSchema } from "@/lib/checkout-schema";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  couponCode: z.string().max(40).optional(),
  uf: z.string().max(2).optional(),
});

/**
 * Cotação do pedido calculada no SERVIDOR (fonte da verdade): mercadorias,
 * "Leve 3, Pague 2", cupom, frete pela UF e total final. O checkout usa isto
 * para exibir os valores exatamente como serão cobrados.
 */
export async function POST(req: Request) {
  const rl = await rateLimit(`quote:${clientIp(req)}`, 40, 60);
  if (!rl.ok) return tooMany();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });

  let subtotalCents: number, discountCents: number, goodsNetCents: number;
  try {
    const priced = await priceOrder(parsed.data.items);
    subtotalCents = priced.grossCents;
    discountCents = priced.discountCents;
    goodsNetCents = priced.totalCents; // pós "Leve 3, Pague 2"
  } catch (e) {
    const msg = e instanceof PricingError ? e.message : "Não foi possível validar o pedido.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // cupom (opcional)
  let coupon: { code: string; discountCents: number } | null = null;
  let couponError: string | undefined;
  if (parsed.data.couponCode) {
    const c = await validateCoupon(parsed.data.couponCode, goodsNetCents);
    if (c.ok) coupon = { code: c.code, discountCents: c.discountCents };
    else couponError = c.error;
  }
  const couponCents = coupon?.discountCents ?? 0;

  // frete (só quando a UF é conhecida)
  const uf = parsed.data.uf?.trim().toUpperCase();
  const freeShipping = goodsNetCents >= FREE_SHIPPING_MIN * 100;
  const freightCents = uf && uf.length === 2 ? freightCentsFor(uf, goodsNetCents) : null;

  const totalCents = goodsNetCents - couponCents + (freightCents ?? 0);

  return NextResponse.json({
    ok: true,
    subtotalCents,
    discountCents,
    coupon,
    couponError,
    freightCents,
    freeShipping,
    freeShippingMinCents: FREE_SHIPPING_MIN * 100,
    totalCents,
  });
}
