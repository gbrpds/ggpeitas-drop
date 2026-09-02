import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePayment, serverTotal } from "@/lib/mp";
import { itemSchema, customerSchema, shippingSchema } from "@/lib/checkout-schema";
import { resolveUserId } from "@/lib/order";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
  customer: customerSchema,
  shipping: shippingSchema,
  payment: z.object({
    token: z.string(),
    payment_method_id: z.string(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    installments: z.number().int().positive(),
  }),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados incompletos para o pagamento." }, { status: 400 });
  }

  const { items, customer, shipping, payment } = parsed.data;
  const amount = serverTotal(items);
  const cpf = customer.cpf.replace(/\D/g, "");

  const mp = await mpCreatePayment(
    {
      transaction_amount: amount,
      token: payment.token,
      description: `Pedido GG Peitas · ${items.length} item(ns)`,
      installments: payment.installments,
      payment_method_id: payment.payment_method_id,
      issuer_id: payment.issuer_id,
      payer: {
        email: customer.email,
        identification: { type: "CPF", number: cpf },
      },
    },
    crypto.randomUUID(),
  );

  if (!mp.ok) {
    console.error("MP card error", mp.data);
    return NextResponse.json(
      { error: "Não foi possível processar o cartão.", detail: mp.data?.message },
      { status: 502 },
    );
  }

  const status = String(mp.data.status ?? "pending"); // approved | in_process | rejected
  const userId = await resolveUserId();
  try {
    const db = getDb();
    await db.insert(orders).values({
      userId,
      status,
      paymentMethod: "card",
      totalCents: Math.round(amount * 100),
      items,
      customer,
      shipping,
      mpPaymentId: String(mp.data.id),
    });
  } catch (e) {
    console.error("save card order error", e);
  }

  return NextResponse.json({
    ok: true,
    status,
    statusDetail: mp.data.status_detail,
    paymentId: mp.data.id,
  });
}
