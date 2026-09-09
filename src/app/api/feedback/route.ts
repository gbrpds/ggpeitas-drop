import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { feedbacks } from "@/db/schema";
import { getOwnedOrder, getOrderByToken } from "@/lib/order";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  token: z.string().max(64).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  const rl = await rateLimit(`fb:${clientIp(req)}`, 10, 600);
  if (!rl.ok) return tooMany();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { orderId, token, rating, comment } = parsed.data;

  // acesso: dono logado ou visitante com o token do pedido
  const order = (await getOwnedOrder(orderId)) ?? (token ? await getOrderByToken(orderId, token) : null);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  try {
    const db = getDb();
    // um feedback por pedido — se já existe, atualiza
    const [existing] = await db
      .select({ id: feedbacks.id })
      .from(feedbacks)
      .where(eq(feedbacks.orderId, orderId))
      .limit(1);

    const customer = (order.customer as { name?: string; email?: string }) ?? {};
    if (existing) {
      await db
        .update(feedbacks)
        .set({ rating, comment: comment || null, createdAt: new Date() })
        .where(eq(feedbacks.id, existing.id));
    } else {
      await db.insert(feedbacks).values({
        orderId,
        orderNumber: order.number,
        userId: order.userId ?? null,
        customerName: customer.name ?? null,
        customerEmail: customer.email ?? null,
        rating,
        comment: comment || null,
      });
    }
  } catch (e) {
    console.error("save feedback error", e);
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
