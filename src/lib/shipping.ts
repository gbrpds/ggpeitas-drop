/** Frete grátis a partir deste valor (em reais). */
export const FREE_SHIPPING_MIN = 299;

/** Prazo único: os produtos são importados (China). */
export const DELIVERY_ESTIMATE = "3 a 4 semanas";

type Region = { label: string; cents: number; ufs: string[] };

const REGIONS: Region[] = [
  { label: "Sudeste", cents: 1590, ufs: ["SP", "RJ", "MG", "ES"] },
  { label: "Sul", cents: 1790, ufs: ["PR", "SC", "RS"] },
  { label: "Centro-Oeste", cents: 2290, ufs: ["DF", "GO", "MT", "MS"] },
  { label: "Nordeste", cents: 2790, ufs: ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"] },
  { label: "Norte", cents: 3490, ufs: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"] },
];

const byUf = new Map<string, Region>();
for (const r of REGIONS) for (const uf of r.ufs) byUf.set(uf, r);

/** Frete para uma UF (fallback: Nordeste, a tarifa média-alta, se UF desconhecida). */
export function shippingForUf(uf: string): { cents: number; label: string } {
  const r = byUf.get(uf.toUpperCase()) ?? REGIONS[3];
  return { cents: r.cents, label: r.label };
}

/**
 * Frete cobrado no pedido: grátis quando o valor das mercadorias (em centavos,
 * já com personalização e pós "Leve 3, Pague 2") atinge o mínimo; senão, a
 * tarifa da região da UF.
 */
export function freightCentsFor(uf: string, goodsBaseCents: number): number {
  if (goodsBaseCents >= FREE_SHIPPING_MIN * 100) return 0;
  return shippingForUf(uf).cents;
}
