import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products, stockNotifications } from "@/db/schema";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  productId: z.string().uuid(),
  email: z.string().email().max(160),
});

/** Inscreve um e-mail para ser avisado quando o produto voltar ao estoque. */
export async function POST(req: Request) {
  const rl = await rateLimit(`stock:${clientIp(req)}`, 10, 3600);
  if (!rl.ok) return tooMany();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  const { productId, email } = parsed.data;
  const em = email.toLowerCase().trim();

  try {
    const db = getDb();
    const [p] = await db
      .select({ inStock: products.inStock, active: products.active })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!p || !p.active) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }
    if (p.inStock) {
      // já está disponível — não precisa inscrever
      return NextResponse.json({ ok: true, alreadyInStock: true });
    }

    // evita duplicar inscrição pendente do mesmo e-mail
    const [exists] = await db
      .select({ id: stockNotifications.id })
      .from(stockNotifications)
      .where(
        and(
          eq(stockNotifications.productId, productId),
          eq(stockNotifications.email, em),
          eq(stockNotifications.notified, false),
        ),
      )
      .limit(1);

    if (!exists) {
      await db.insert(stockNotifications).values({ productId, email: em });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("stock-notify error", e);
    return NextResponse.json({ error: "Não foi possível registrar agora." }, { status: 500 });
  }
}
