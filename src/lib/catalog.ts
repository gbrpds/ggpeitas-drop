import { desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { products, reviews } from "@/db/schema";
import { sections as mockSections, type Product, type ProductSection } from "@/data/products";
import { getProduct as getMockProduct } from "@/lib/product";

/**
 * Leitura do catálogo em CACHE (produtos mudam pouco). Invalidada na hora
 * que o admin cria/edita produto (revalidateTag("products")). Evita bater no
 * Neon a cada visita — o maior ganho de velocidade nas páginas de navegação.
 */
const getProductRows = unstable_cache(
  async () => {
    const db = getDb();
    return db.select().from(products).orderBy(desc(products.createdAt));
  },
  ["catalog:product-rows"],
  { tags: ["products"], revalidate: 120 },
);

/** Avaliações (id do produto + nota) em cache; invalida em revalidateTag("reviews"). */
const getRatingRows = unstable_cache(
  async () => {
    const db = getDb();
    return db.select({ productId: reviews.productId, rating: reviews.rating }).from(reviews);
  },
  ["catalog:rating-rows"],
  { tags: ["reviews"], revalidate: 120 },
);

/** Anexa média/total de avaliações a uma lista de produtos (do cache). */
async function withRatings(items: Product[]): Promise<Product[]> {
  if (!items.length) return items;
  const rows = await getRatingRows();
  const acc = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const a = acc.get(r.productId) ?? { sum: 0, count: 0 };
    a.sum += r.rating;
    a.count++;
    acc.set(r.productId, a);
  }
  for (const p of items) {
    const a = acc.get(p.id);
    if (a) p.rating = { avg: a.sum / a.count, count: a.count };
  }
  return items;
}

const FALLBACK_COLORS: [string, string, string] = ["#0f8a3d", "#ffc400", "#ffffff"];

/** Metadados por tag/categoria (título e emoji da seção na home). */
const CATEGORY_META: Record<string, { title: string; emoji: string; href: string }> = {
  brasileirao: { title: "Gigantes do Brasileirão", emoji: "", href: "/categoria/brasileirao" },
  europa: { title: "Elite Europeia", emoji: "", href: "/categoria/europa" },
  selecoes: { title: "Seleções", emoji: "", href: "/categoria/selecoes" },
  futebol: { title: "Futebol", emoji: "", href: "/categoria/futebol" },
  feminina: { title: "Feminina", emoji: "", href: "/categoria/feminina" },
  infantil: { title: "Conjunto Infantil", emoji: "", href: "/categoria/infantil" },
  retro: { title: "Retrô Lendárias", emoji: "", href: "/categoria/retro" },
};

const ORDER = ["brasileirao", "europa", "selecoes", "futebol", "feminina", "infantil", "retro"];

type Row = typeof products.$inferSelect;

function mapRow(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    now: r.priceCents / 100,
    was: r.compareCents ? r.compareCents / 100 : undefined,
    colors: FALLBACK_COLORS,
    images: (r.images as string[]) ?? [],
    team: r.team ?? undefined,
    version: r.version ?? undefined,
    inStock: r.inStock,
    promo3x2: r.promo3x2,
  };
}

/** Produtos ativos participando do "Leve 3, Pague 2". */
export async function getPromoProducts(): Promise<Product[]> {
  try {
    const rows = await allRows();
    if (rows.length) return withRatings(rows.filter((r) => r.active && r.promo3x2).map(mapRow));
  } catch {
    /* sem banco */
  }
  return [];
}

/** Todos os produtos (ativos e inativos) — do cache. */
async function allRows(): Promise<Row[]> {
  return getProductRows();
}

export function metaFor(cat: string) {
  return CATEGORY_META[cat] ?? { title: cat, emoji: "", href: `/categoria/${cat}` };
}

/** Seções da home a partir do banco (agrupadas por tag). Banco vazio → mock. */
export async function getHomeSections(): Promise<ProductSection[]> {
  try {
    const rows = await allRows();
    if (!rows.length) return mockSections; // nenhum produto cadastrado → demo

    const byCat = new Map<string, Product[]>();
    for (const r of rows) {
      if (!r.active) continue; // só produtos ativos aparecem na loja
      const arr = byCat.get(r.category) ?? [];
      arr.push(mapRow(r));
      byCat.set(r.category, arr);
    }

    const cats = [...byCat.keys()].sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    const built = cats.map((cat) => {
      const m = metaFor(cat);
      return { id: cat, title: m.title, emoji: m.emoji, href: m.href, products: byCat.get(cat)! };
    });
    await withRatings(built.flatMap((s) => s.products));
    return built;
  } catch {
    return mockSections;
  }
}

/** Produtos de uma tag/categoria (para a página de categoria). */
export async function getCategoryProducts(cat: string): Promise<Product[]> {
  try {
    const rows = await allRows();
    if (rows.length) {
      return withRatings(rows.filter((r) => r.active && r.category === cat).map(mapRow));
    }
  } catch {
    /* cai no mock */
  }
  // banco vazio → mock com a mesma categoria
  return mockSections.flatMap((s) => s.products).filter((p) => p.category === cat);
}

/** Todos os produtos ativos (para a busca). Banco vazio → mock. */
export async function getAllActive(): Promise<Product[]> {
  try {
    const rows = await allRows();
    if (rows.length) return withRatings(rows.filter((r) => r.active).map(mapRow));
  } catch {
    /* cai no mock */
  }
  return mockSections.flatMap((s) => s.products);
}

/** Um produto: procura no catálogo em cache; senão, o mock. */
export async function getCatalogProduct(id: string): Promise<Product | undefined> {
  try {
    const rows = await allRows();
    const r = rows.find((x) => x.id === id);
    if (r) return mapRow(r);
  } catch {
    /* sem banco → mock */
  }
  return getMockProduct(id);
}
