import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { mpCreatePreference } from "@/lib/mp";
import { getOwnedOrder, getOrderByToken, effectiveStatus } from "@/lib/order";

export const runtime = "nodejs";

type Item = { id: string; name: string; price: number; qty: number };

// tipos de pagamento a esconder conforme a opção escolhida na retomada
const EXCLUDE_FOR = {
  card: ["ticket"], // cartão: sem boleto
  boleto: ["credit_card", "debit_card", "prepaid_card", "bank_transfer", "digital_wallet", "atm"],
} as const;

/** Abre o Checkout Pro (cartão ou boleto) para retomar o pagamento de um pedido. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const method = url.searchParams.get("method") === "boleto" ? "boleto" : "card";
  // dono logado, ou visitante com o token de acesso do pedido
  const order = (await getOwnedOrder(id)) ?? (token ? await getOrderByToken(id, token) : null);
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

  // reinicia a janela (10 min cartão / 4 dias boleto) e grava o método escolhido
  try {
    await getDb()
      .update(orders)
      .set({ createdAt: new Date(), paymentMethod: method })
      .where(eq(orders.id, order.id));
  } catch (e) {
    console.error("reset order window error", e);
  }

  const origin = url.origin;
  // token no retorno para o visitante conseguir ver o pedido mesmo sem conta
  const backUrl = `${origin}/pedido/${order.id}${token ? `?t=${token}` : ""}`;

  // mercadorias = total − frete (o total já é o valor final cobrado)
  const goodsCents = order.totalCents - order.freightCents;
  const goodsItems =
    order.discountCents > 0 || order.couponCents > 0
      ? [{ title: `Pedido GG Peitas #${order.number}`, quantity: 1, unit_price: goodsCents / 100 }]
      : items.map((i) => ({ title: i.name, quantity: i.qty, unit_price: i.price }));
  const mpItems =
    order.freightCents > 0
      ? [...goodsItems, { title: "Frete", quantity: 1, unit_price: order.freightCents / 100 }]
      : goodsItems;

  const mp = await mpCreatePreference({
    items: mpItems,
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
    excludePaymentTypes: [...EXCLUDE_FOR[method]],
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
