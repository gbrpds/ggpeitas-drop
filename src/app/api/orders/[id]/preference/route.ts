import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePreference } from "@/lib/mp";
import { getOwnedOrder, effectiveStatus } from "@/lib/order";

export const runtime = "nodejs";

type Item = { id: string; name: string; price: number; qty: number };

/** Abre o Checkout Pro (cartão) para retomar o pagamento de um pedido existente. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const customer = order.customer as { name?: string; cpf: string; email: string };
  const items = (order.items as Item[]) ?? [];
  const [firstName, ...rest] = (customer.name ?? "Cliente").trim().split(" ");

  // reinicia a janela de 15 min, já que o cliente está retomando o pagamento
  try {
    await getDb().update(orders).set({ createdAt: new Date() }).where(eq(orders.id, order.id));
  } catch (e) {
    console.error("reset order window error", e);
  }

  const origin = new URL(req.url).origin;
  const backUrl = `${origin}/pedido/${order.id}`;

  const mp = await mpCreatePreference({
    items: items.map((i) => ({ title: i.name, quantity: i.qty, unit_price: i.price })),
    payer: {
      name: firstName,
      surname: rest.join(" ") || firstName,
      email: customer.email,
      identification: { type: "CPF", number: customer.cpf.replace(/\D/g, "") },
    },
    externalReference: order.id,
    backUrls: { success: backUrl, failure: backUrl, pending: backUrl },
    notificationUrl: `${origin}/api/webhooks/mp`,
    installments: 12,
  });

  if (!mp.ok) {
    console.error("MP preference (resume) error", mp.data);
    return NextResponse.json(
      { error: "Não foi possível abrir o checkout do Mercado Pago." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    initPoint: mp.data.init_point ?? mp.data.sandbox_init_point,
  });
}
