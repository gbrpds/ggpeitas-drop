import { sections, type Product } from "@/data/products";

export const SIZES = ["P", "M", "G", "GG", "XGG"] as const;
export const VERSIONS = ["Torcedor"] as const;

/** Todos os produtos achatados (todas as seções), sem repetir por id. */
export function allProducts(): Product[] {
  const map = new Map<string, Product>();
  for (const s of sections) for (const p of s.products) if (!map.has(p.id)) map.set(p.id, p);
  return [...map.values()];
}

export function getProduct(id: string): Product | undefined {
  return allProducts().find((p) => p.id === id);
}

/** Descrição padrão (placeholder) enquanto não vem do banco. */
export function defaultDescription(p: Product): string {
  return `A ${p.name} é uma camisa de futebol importada de alta qualidade, com tecido leve e respirável, ideal para os jogos ou para o dia a dia. Modelo tailandesa 1ª linha (versão Torcedor), com acabamento premium em escudo e patrocínios. Disponível nos tamanhos P ao XGG.`;
}
