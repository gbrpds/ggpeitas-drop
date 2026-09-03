import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePayment } from "@/lib/mp";
import { getOwnedOrder } from "@/lib/order";

export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string(),
  payment_method_id: z.string(),
  issuer_id: z.union([z.string(), z.number()]).optional(),
  installments: z.number().int().positive(),
});

/** Retoma o pagamento no cartão de um pedido existente. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOwnedOrder(id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status === "approved") return NextResponse.json({ status: "approved" });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados do cartão inválidos." }, { status: 400 });
  const payment = parsed.data;

  const customer = order.customer as { cpf: string; email: string };
  const amount = order.totalCents / 100;

  const mp = await mpCreatePayment(
    {
      transaction_amount: amount,
      token: payment.token,
      description: `Pedido GG Peitas #${order.number}`,
      installments: payment.installments,
      payment_method_id: payment.payment_method_id,
      issuer_id: payment.issuer_id,
      payer: {
        email: customer.email,
        identification: { type: "CPF", number: customer.cpf.replace(/\D/g, "") },
      },
    },
    crypto.randomUUID(),
  );

  if (!mp.ok) return NextResponse.json({ error: "Pagamento não aprovado." }, { status: 502 });

  const raw = String(mp.data.status ?? "pending");
  const status = raw === "rejected" ? "cancelled" : raw === "in_process" ? "pending" : raw;
  try {
    const db = getDb();
    await db
      .update(orders)
      .set({ status, paymentMethod: "card", mpPaymentId: String(mp.data.id), createdAt: new Date() })
      .where(eq(orders.id, order.id));
  } catch (e) {
    console.error("resume card update error", e);
  }

  return NextResponse.json({ status: raw });
}
