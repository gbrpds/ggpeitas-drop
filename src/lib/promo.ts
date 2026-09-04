/** Promoção "Leve 3, Pague 2". */
export const PROMO_HREF = "/promocao";
export const PROMO_TITLE = "Leve 3, Pague 2";

/**
 * Desconto "Leve 3, Pague 2" sobre as unidades elegíveis.
 * Regra: a cada 3 unidades, a mais barata sai grátis.
 * Recebe/retorna valores em CENTAVOS (inteiros).
 */
export function promoDiscountCents(unitPricesCents: number[]): number {
  if (unitPricesCents.length < 3) return 0;
  const asc = [...unitPricesCents].sort((a, b) => a - b); // mais baratas primeiro
  const freeCount = Math.floor(unitPricesCents.length / 3);
  let discount = 0;
  for (let i = 0; i < freeCount; i++) discount += asc[i];
  return discount;
}

/** Mesma regra, mas a partir de itens {priceCents|price, qty, promo}. */
export function promoDiscountFromItems(
  items: { priceCents: number; qty: number; promo: boolean }[],
): number {
  const units: number[] = [];
  for (const it of items) {
    if (!it.promo) continue;
    for (let i = 0; i < it.qty; i++) units.push(it.priceCents);
  }
  return promoDiscountCents(units);
}
