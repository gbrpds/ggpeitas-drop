import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { mpCreatePayment } from "@/lib/mp";
import { priceOrder, PricingError } from "@/lib/pricing";
import { itemSchema, customerSchema, shippingSchema } from "@/lib/checkout-schema";
import { resolveUserId, createOrder } from "@/lib/order";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  customer: customerSchema,
  shipping: shippingSchema,
});

export async function POST(req: Request) {
  const rl = await rateLimit(`chk:${clientIp(req)}`, 15, 60);
  if (!rl.ok) return tooMany();

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados incompletos para gerar o PIX." }, { status: 400 });
  }

  const { customer, shipping } = parsed.data;
  // PREÇO REAL vindo do banco — nunca do cliente
  let amount: number;
  let discountCents = 0;
  let items: Awaited<ReturnType<typeof priceOrder>>["items"];
  try {
    const priced = await priceOrder(parsed.data.items);
    amount = priced.totalCents / 100; // já líquido (Leve 3, Pague 2)
    discountCents = priced.discountCents;
    items = priced.items;
  } catch (e) {
    const msg = e instanceof PricingError ? e.message : "Não foi possível validar o pedido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const [firstName, ...rest] = customer.name.trim().split(" ");
  const cpf = customer.cpf.replace(/\D/g, "");

  const mp = await mpCreatePayment(
    {
      transaction_amount: amount,
      description: `Pedido GG Peitas · ${items.length} item(ns)`,
      payment_method_id: "pix",
      payer: {
        email: customer.email,
        first_name: firstName,
        last_name: rest.join(" ") || firstName,
        identification: { type: "CPF", number: cpf },
      },
    },
    crypto.randomUUID(),
  );

  if (!mp.ok) {
    console.error("MP pix error", mp.data);
    return NextResponse.json({ error: "Não foi possível gerar o PIX." }, { status: 502 });
  }

  const userId = await resolveUserId();
  let number: string | null = null;
  let orderId: string | null = null;
  try {
    const created = await createOrder(getDb(), {
      userId,
      status: "pending",
      paymentMethod: "pix",
      totalCents: Math.round(amount * 100),
      discountCents,
      items,
      customer,
      shipping,
      mpPaymentId: String(mp.data.id),
    });
    number = created.number;
    orderId = created.id;
  } catch (e) {
    console.error("save pix order error", e);
  }

  const td = mp.data.point_of_interaction?.transaction_data ?? {};
  return NextResponse.json({
    ok: true,
    number,
    orderId,
    paymentId: mp.data.id,
    amount,
    qrCode: td.qr_code,
    qrCodeBase64: td.qr_code_base64,
    ticketUrl: td.ticket_url,
  });
}
