import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews, orders } from "@/db/schema";

export type ReviewItem = {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: string;
  mine?: boolean;
};

export type ReviewSummary = { avg: number; count: number; dist: number[] }; // dist[0]=1★ ... dist[4]=5★

/** Lista as avaliações de um produto + resumo (média, total, distribuição). */
export async function getProductReviews(
  productId: string,
  currentUserId?: string | null,
): Promise<{ list: ReviewItem[]; summary: ReviewSummary }> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of rows) {
      const k = Math.min(5, Math.max(1, r.rating));
      dist[k - 1]++;
      sum += r.rating;
    }
    const count = rows.length;
    const avg = count ? sum / count : 0;

    const list: ReviewItem[] = rows.map((r) => ({
      id: r.id,
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
      mine: !!currentUserId && r.userId === currentUserId,
    }));

    return { list, summary: { avg, count, dist } };
  } catch {
    return { list: [], summary: { avg: 0, count: 0, dist: [0, 0, 0, 0, 0] } };
  }
}

/** Agregados (média + total) para vários produtos de uma vez — usado nos cards. */
export async function getRatingsFor(
  productIds: string[],
): Promise<Map<string, { avg: number; count: number }>> {
  const map = new Map<string, { avg: number; count: number }>();
  const ids = productIds.filter(Boolean);
  if (!ids.length) return map;
  try {
    const db = getDb();
    const rows = await db
      .select({ productId: reviews.productId, rating: reviews.rating })
      .from(reviews)
      .where(inArray(reviews.productId, ids));
    const acc = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      const a = acc.get(r.productId) ?? { sum: 0, count: 0 };
      a.sum += r.rating;
      a.count++;
      acc.set(r.productId, a);
    }
    for (const [pid, a] of acc) map.set(pid, { avg: a.sum / a.count, count: a.count });
  } catch {
    /* sem avaliações */
  }
  return map;
}

/** Diz se o usuário tem pedido PAGO contendo o produto (para "compra verificada"). */
export async function userHasBought(userId: string, productId: string): Promise<boolean> {
  try {
    const db = getDb();
    const rows = await db
      .select({ items: orders.items })
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, "approved")));
    for (const o of rows) {
      const items = (o.items as { id: string }[]) ?? [];
      // o id do item do carrinho é "<productId>-<tam>-<versao>" (ou só o productId)
      if (items.some((it) => it.id === productId || it.id.startsWith(`${productId}-`))) {
        return true;
      }
    }
  } catch {
    /* ignora */
  }
  return false;
}
