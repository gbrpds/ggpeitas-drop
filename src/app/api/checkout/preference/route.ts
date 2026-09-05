import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { mpCreatePreference } from "@/lib/mp";
import { priceOrder, PricingError } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";
import { freightCentsFor } from "@/lib/shipping";
import { itemSchema, customerSchema, shippingSchema } from "@/lib/checkout-schema";
import { resolveUserId, createOrder } from "@/lib/order";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  customer: customerSchema,
  shipping: shippingSchema,
  couponCode: z.string().max(40).optional(),
  method: z.enum(["card", "boleto"]).default("card"),
});

// tipos de pagamento a esconder no Checkout Pro conforme a opção escolhida
const EXCLUDE_FOR = {
  card: ["ticket"], // cartão: sem boleto
  boleto: ["credit_card", "debit_card", "prepaid_card", "bank_transfer", "digital_wallet", "atm"],
} as const;

export async function POST(req: Request) {
  const rl = await rateLimit(`chk:${clientIp(req)}`, 15, 60);
  if (!rl.ok) return tooMany();

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados incompletos para o pagamento." }, { status: 400 });
  }

  const { customer, shipping, method } = parsed.data;
  // PREÇO REAL vindo do banco — nunca do cliente
  let goodsNetCents = 0;
  let discountCents = 0;
  let items: Awaited<ReturnType<typeof priceOrder>>["items"];
  try {
    const priced = await priceOrder(parsed.data.items);
    goodsNetCents = priced.totalCents; // pós "Leve 3, Pague 2" (personalização inclusa)
    discountCents = priced.discountCents;
    items = priced.items;
  } catch (e) {
    const msg = e instanceof PricingError ? e.message : "Não foi possível validar o pedido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // cupom (revalidado no servidor; se ficou inválido, apenas ignora)
  let couponCode: string | null = null;
  let couponCents = 0;
  if (parsed.data.couponCode) {
    const c = await validateCoupon(parsed.data.couponCode, goodsNetCents);
    if (c.ok && c.discountCents > 0) {
      couponCode = c.code;
      couponCents = c.discountCents;
    }
  }

  // frete da região (grátis se as mercadorias atingem o mínimo)
  const freightCents = freightCentsFor(shipping.uf, goodsNetCents);
  const goodsAfterCoupon = goodsNetCents - couponCents;
  const finalCents = goodsAfterCoupon + freightCents;

  const cpf = customer.cpf.replace(/\D/g, "");
  const [firstName, ...rest] = customer.name.trim().split(" ");

  // 1) cria o pedido (pendente) para ter um id que vira external_reference
  const userId = await resolveUserId();
  let number: string | null = null;
  let orderId: string | null = null;
  try {
    const created = await createOrder(getDb(), {
      userId,
      status: "pending",
      paymentMethod: method,
      totalCents: finalCents,
      discountCents,
      couponCode,
      couponCents,
      freightCents,
      items,
      customer,
      shipping,
    });
    number = created.number;
    orderId = created.id;
  } catch (e) {
    console.error("save preference order error", e);
  }

  if (!orderId) {
    return NextResponse.json({ error: "Não foi possível registrar o pedido." }, { status: 500 });
  }

  // 2) monta as URLs de retorno/notificação a partir da origem da requisição
  const origin = new URL(req.url).origin;
  const backUrl = `${origin}/pedido/${orderId}`;

  // Mercadorias: itens detalhados, ou 1 item consolidado quando há desconto
  // (o Checkout Pro soma os itens e não aceita linha de desconto negativa).
  const units = items.reduce((n, i) => n + i.qty, 0);
  const goodsItems =
    discountCents > 0 || couponCents > 0
      ? [{ title: `Pedido GG Peitas · ${units} ${units === 1 ? "camisa" : "camisas"}`, quantity: 1, unit_price: goodsAfterCoupon / 100 }]
      : items.map((i) => ({ title: i.name, quantity: i.qty, unit_price: i.price }));
  // frete entra como linha própria (positiva)
  const mpItems =
    freightCents > 0
      ? [...goodsItems, { title: "Frete", quantity: 1, unit_price: freightCents / 100 }]
      : goodsItems;

  const mp = await mpCreatePreference({
    items: mpItems,
    payer: {
      name: firstName,
      surname: rest.join(" ") || firstName,
      email: customer.email,
      identification: { type: "CPF", number: cpf },
    },
    externalReference: orderId,
    backUrls: { success: backUrl, failure: backUrl, pending: backUrl },
    notificationUrl: `${origin}/api/webhooks/mp`,
    installments: 12,
    excludePaymentTypes: [...EXCLUDE_FOR[method]],
  });

  if (!mp.ok) {
    console.error("MP preference error", mp.data);
    return NextResponse.json(
      { error: "Não foi possível abrir o checkout do Mercado Pago." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    number,
    orderId,
    // init_point = produção; sandbox_init_point = ambiente de teste
    initPoint: mp.data.init_point ?? mp.data.sandbox_init_point,
  });
}
