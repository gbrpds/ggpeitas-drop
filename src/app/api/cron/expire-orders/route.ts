import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { expireStaleOrders } from "@/lib/order";

export const runtime = "nodejs";

/**
 * Cron: cancela pedidos "em aberto" há mais de 10 min.
 * A Vercel chama com header Authorization: Bearer <CRON_SECRET> quando o
 * env CRON_SECRET está definido. Fora isso, exige o mesmo segredo.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }
  }

  try {
    await expireStaleOrders(getDb());
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
  } catch (e) {
    console.error("cron expire-orders error", e);
    return NextResponse.json({ error: "falha" }, { status: 500 });
  }
}
