import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";

export const runtime = "nodejs";

/** Consulta o status de um pagamento no Mercado Pago e sincroniza o pedido. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId ausente" }, { status: 400 });

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const status = String(data.status ?? "unknown"); // approved | pending | cancelled | rejected

    // sincroniza o pedido (só sai de pending)
    if (status === "approved" || status === "cancelled" || status === "rejected") {
      try {
        const db = getDb();
        await db
          .update(orders)
          .set({ status: status === "rejected" ? "cancelled" : status })
          .where(and(eq(orders.mpPaymentId, String(paymentId)), eq(orders.status, "pending")));
      } catch (e) {
        console.error("sync order status error", e);
      }
    }

    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o pagamento." }, { status: 502 });
  }
}
