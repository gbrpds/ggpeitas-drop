import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stockNotifications, products } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { backInStockEmail } from "@/lib/email-templates";
import { baseUrl } from "@/lib/site-url";

/**
 * Notifica (uma vez) todos os inscritos "avise-me quando voltar" de um produto
 * e marca como notificados. Chamado quando o admin marca o produto como
 * disponível de novo. Não lança — só loga em caso de falha.
 */
export async function notifyBackInStock(productId: string): Promise<number> {
  try {
    const db = getDb();
    const [p] = await db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!p) return 0;

    const subs = await db
      .select({ id: stockNotifications.id, email: stockNotifications.email })
      .from(stockNotifications)
      .where(and(eq(stockNotifications.productId, productId), eq(stockNotifications.notified, false)));

    if (!subs.length) return 0;

    const tpl = backInStockEmail({
      productName: p.name,
      productUrl: `${baseUrl()}/produto/${productId}`,
    });

    let sent = 0;
    for (const s of subs) {
      const res = await sendEmail({ to: s.email, subject: tpl.subject, html: tpl.html });
      // só marca como notificado quando REALMENTE enviou (sem chave, tenta de novo depois)
      if (res.ok) {
        await db.update(stockNotifications).set({ notified: true }).where(eq(stockNotifications.id, s.id));
        sent++;
      }
    }
    return sent;
  } catch (e) {
    console.error("notifyBackInStock error", e);
    return 0;
  }
}
