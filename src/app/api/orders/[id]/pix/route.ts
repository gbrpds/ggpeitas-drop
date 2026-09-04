import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePayment } from "@/lib/mp";
import { getOwnedOrder, effectiveStatus } from "@/lib/order";

export const runtime = "nodejs";

/** Retoma o pagamento PIX de um pedido: gera um novo PIX e reinicia a janela. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOwnedOrder(id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status === "approved") return NextResponse.json({ status: "approved" });
  if (effectiveStatus(order) === "cancelled") {
    return NextResponse.json(
      { error: "Pedido cancelado por falta de pagamento. Faça um novo pedido." },
      { status: 409 },
    );
  }

  const customer = order.customer as { name: string; cpf: string; email: string };
  const amount = order.totalCents / 100;
  const [firstName, ...rest] = customer.name.trim().split(" ");
  const cpf = customer.cpf.replace(/\D/g, "");

  const mp = await mpCreatePayment(
    {
      transaction_amount: amount,
      description: `Pedido GG Peitas #${order.number}`,
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
    return NextResponse.json({ error: "Não foi possível gerar o PIX." }, { status: 502 });
  }

  try {
    const db = getDb();
    await db
      .update(orders)
      .set({ status: "pending", mpPaymentId: String(mp.data.id), createdAt: new Date() })
      .where(eq(orders.id, order.id));
  } catch (e) {
    console.error("resume pix update error", e);
  }

  const td = mp.data.point_of_interaction?.transaction_data ?? {};
  return NextResponse.json({
    status: "pending",
    paymentId: mp.data.id,
    qrCode: td.qr_code,
    qrCodeBase64: td.qr_code_base64,
  });
}
