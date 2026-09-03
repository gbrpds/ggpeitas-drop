import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { sections as mockSections, type Product, type ProductSection } from "@/data/products";
import { getProduct as getMockProduct } from "@/lib/product";

const FALLBACK_COLORS: [string, string, string] = ["#0f8a3d", "#ffc400", "#ffffff"];

/** Metadados por tag/categoria (título e emoji da seção na home). */
const CATEGORY_META: Record<string, { title: string; emoji: string; href: string }> = {
  brasileirao: { title: "Gigantes do Brasileirão", emoji: "🇧🇷", href: "/categoria/brasileirao" },
  europa: { title: "Elite Europeia", emoji: "🌍", href: "/categoria/europa" },
  selecoes: { title: "Seleções", emoji: "🏆", href: "/categoria/selecoes" },
  futebol: { title: "Futebol", emoji: "⚽", href: "/categoria/futebol" },
  feminina: { title: "Feminina", emoji: "👩", href: "/categoria/feminina" },
  infantil: { title: "Conjunto Infantil", emoji: "💫", href: "/categoria/infantil" },
  player: { title: "Player (Authentic)", emoji: "⭐", href: "/categoria/player" },
  retro: { title: "Retrô Lendárias", emoji: "🕰️", href: "/categoria/retro" },
};

const ORDER = ["brasileirao", "europa", "selecoes", "futebol", "feminina", "infantil", "player", "retro"];

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
  };
}

async function activeRows(): Promise<Row[]> {
  const db = getDb();
  return db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt));
}

export function metaFor(cat: string) {
  return CATEGORY_META[cat] ?? { title: cat, emoji: "🔥", href: `/categoria/${cat}` };
}

/** Seções da home a partir do banco (agrupadas por tag). Sem produtos → mock. */
export async function getHomeSections(): Promise<ProductSection[]> {
  try {
    const rows = await activeRows();
    if (!rows.length) return mockSections;

    const byCat = new Map<string, Product[]>();
    for (const r of rows) {
      const arr = byCat.get(r.category) ?? [];
      arr.push(mapRow(r));
      byCat.set(r.category, arr);
    }

    const cats = [...byCat.keys()].sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return cats.map((cat) => {
      const m = metaFor(cat);
      return { id: cat, title: m.title, emoji: m.emoji, href: m.href, products: byCat.get(cat)! };
    });
  } catch {
    return mockSections;
  }
}

/** Produtos de uma tag/categoria (para a página de categoria). */
export async function getCategoryProducts(cat: string): Promise<Product[]> {
  try {
    const rows = await activeRows();
    const items = rows.filter((r) => r.category === cat).map(mapRow);
    if (items.length) return items;
  } catch {
    /* cai no mock */
  }
  // fallback: mock com a mesma categoria
  return mockSections.flatMap((s) => s.products).filter((p) => p.category === cat);
}

/** Um produto: tenta o banco (uuid); senão, o mock. */
export async function getCatalogProduct(id: string): Promise<Product | undefined> {
  try {
    const db = getDb();
    const [r] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (r) return mapRow(r);
  } catch {
    /* id não-uuid ou sem banco → mock */
  }
  return getMockProduct(id);
}
