import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";
import { resolveUserId } from "@/lib/order";
import { userHasBought } from "@/lib/reviews";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";

export const runtime = "nodejs";

const bodySchema = z.object({
  productId: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

/** Cria ou atualiza a avaliação do usuário logado para um produto. */
export async function POST(req: Request) {
  const session = await auth();
  const userId = await resolveUserId();
  if (!session?.user || !userId) {
    return NextResponse.json({ error: "Entre para avaliar." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
  }
  const { productId, rating, comment } = parsed.data;
  const userName = session.user.name?.split(" ").slice(0, 2).join(" ") || "Cliente";
  const verified = await userHasBought(userId, productId);

  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existing) {
      await db
        .update(reviews)
        .set({ rating, comment: comment ?? null, verified, userName })
        .where(eq(reviews.id, existing.id));
    } else {
      await db.insert(reviews).values({
        productId,
        userId,
        userName,
        rating,
        comment: comment ?? null,
        verified,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("create review error", e);
    return NextResponse.json({ error: "Não foi possível salvar a avaliação." }, { status: 500 });
  }
}

/** Exclui uma avaliação (autor ou admin). */
export async function DELETE(req: Request) {
  const session = await auth();
  const userId = await resolveUserId();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id ausente." }, { status: 400 });

  try {
    const db = getDb();
    const [r] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!r) return NextResponse.json({ ok: true });
    const isAdmin = isAdminEmail(session.user.email);
    if (r.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }
    await db.delete(reviews).where(eq(reviews.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete review error", e);
    return NextResponse.json({ error: "Falha ao excluir." }, { status: 500 });
  }
}
