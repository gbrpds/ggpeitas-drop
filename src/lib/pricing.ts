import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export type ClientItem = {
  productId: string;
  qty: number;
  size?: string;
  version?: string;
};

/** Item já resolvido com o PREÇO REAL do banco (nunca o do cliente). */
export type PricedItem = {
  productId: string;
  name: string;
  price: number; // reais (para exibição/e-mails)
  qty: number;
  size?: string;
  version?: string;
};

export class PricingError extends Error {}

/**
 * Recalcula o pedido a partir do banco. IGNORA qualquer preço enviado pelo
 * cliente. Lança PricingError se algum produto não existe / está inativo.
 */
export async function priceOrder(items: ClientItem[]): Promise<{
  totalCents: number;
  items: PricedItem[];
}> {
  if (!items.length) throw new PricingError("Carrinho vazio.");
  const db = getDb();
  const ids = [...new Set(items.map((i) => i.productId))];
  const rows = await db.select().from(products).where(inArray(products.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));

  let totalCents = 0;
  const priced: PricedItem[] = items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw new PricingError("Produto não encontrado.");
    if (!p.active) throw new PricingError(`"${p.name}" está indisponível.`);
    if (i.qty < 1 || i.qty > 20 || !Number.isInteger(i.qty)) {
      throw new PricingError("Quantidade inválida.");
    }
    totalCents += p.priceCents * i.qty; // inteiro, em centavos — sem float
    const suffix = [i.size, i.version].filter(Boolean).join(" · ");
    return {
      productId: p.id,
      name: suffix ? `${p.name} (${suffix})` : p.name,
      price: p.priceCents / 100,
      qty: i.qty,
      size: i.size,
      version: i.version,
    };
  });

  return { totalCents, items: priced };
}
