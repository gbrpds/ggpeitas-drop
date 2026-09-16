import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site-url";
import { getAllActive } from "@/lib/catalog";
import { blogPosts } from "@/data/blog";

export const revalidate = 3600; // atualiza o sitemap de hora em hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = baseUrl();
  const now = new Date();
  const cats = ["brasileirao", "europa", "mundo", "selecoes", "retro", "feminina", "infantil"];
  const staticPaths = ["", "/busca", "/promocao", "/solicitar", "/rastrear", "/blog", "/quem-somos", "/contato", "/faq", "/trocas"];

  let products: { id: string }[] = [];
  try {
    products = (await getAllActive()).map((p) => ({ id: p.id }));
  } catch {
    /* sem banco → só as páginas fixas */
  }

  return [
    ...staticPaths.map((p) => ({
      url: `${url}${p}`,
      lastModified: now,
      changeFrequency: (p === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: p === "" ? 1 : 0.7,
    })),
    ...cats.map((c) => ({
      url: `${url}/categoria/${c}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((p) => ({
      url: `${url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${url}/produto/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
