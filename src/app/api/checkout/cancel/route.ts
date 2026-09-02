import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

export const runtime = "nodejs";

/** Marca o pedido como cancelado (ex.: PIX expirou sem pagamento). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const paymentId = body?.paymentId ? String(body.paymentId) : null;
  if (!paymentId) return NextResponse.json({ error: "paymentId ausente" }, { status: 400 });

  try {
    const db = getDb();
    await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(and(eq(orders.mpPaymentId, paymentId), eq(orders.status, "pending")));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancel order error", e);
    return NextResponse.json({ error: "Falha ao cancelar." }, { status: 500 });
  }
}
