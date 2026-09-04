import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePreference } from "@/lib/mp";
import { priceOrder, PricingError } from "@/lib/pricing";
import { itemSchema, customerSchema, shippingSchema } from "@/lib/checkout-schema";
import { resolveUserId, genOrderNumber } from "@/lib/order";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  customer: customerSchema,
  shipping: shippingSchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados incompletos para o pagamento." }, { status: 400 });
  }

  const { customer, shipping } = parsed.data;
  // PREÇO REAL vindo do banco — nunca do cliente
  let amount: number;
  let items: Awaited<ReturnType<typeof priceOrder>>["items"];
  try {
    const priced = await priceOrder(parsed.data.items);
    amount = priced.totalCents / 100;
    items = priced.items;
  } catch (e) {
    const msg = e instanceof PricingError ? e.message : "Não foi possível validar o pedido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const cpf = customer.cpf.replace(/\D/g, "");
  const [firstName, ...rest] = customer.name.trim().split(" ");

  // 1) cria o pedido (pendente) para ter um id que vira external_reference
  const userId = await resolveUserId();
  let number: string | null = null;
  let orderId: string | null = null;
  try {
    const db = getDb();
    number = await genOrderNumber(db);
    const [row] = await db
      .insert(orders)
      .values({
        number,
        userId,
        status: "pending",
        paymentMethod: "card",
        totalCents: Math.round(amount * 100),
        items,
        customer,
        shipping,
      })
      .returning({ id: orders.id });
    orderId = row?.id ?? null;
  } catch (e) {
    console.error("save preference order error", e);
  }

  if (!orderId) {
    return NextResponse.json({ error: "Não foi possível registrar o pedido." }, { status: 500 });
  }

  // 2) monta as URLs de retorno/notificação a partir da origem da requisição
  const origin = new URL(req.url).origin;
  const backUrl = `${origin}/pedido/${orderId}`;

  const mp = await mpCreatePreference({
    items: items.map((i) => ({ title: i.name, quantity: i.qty, unit_price: i.price })),
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
  });

  if (!mp.ok) {
    console.error("MP preference error", mp.data);
    return NextResponse.json(
      { error: "Não foi possível abrir o checkout do Mercado Pago.", detail: mp.data?.message },
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
