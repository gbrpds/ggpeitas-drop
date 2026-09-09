import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidateTag } from "next/cache";
import { eq, or, ilike } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import {
  yupooHeaders,
  parseCategory,
  parseAlbumPhotos,
  photoUrl,
  yupooTitleToProduct,
  shouldSkipTitle,
} from "@/lib/yupoo";

export const runtime = "nodejs";
export const maxDuration = 60;

function originOf(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "https://x.yupoo.com";
  }
}

/** Baixa uma foto do Yupoo (com referer) e re-hospeda no Vercel Blob. */
async function reupload(base: string, referer: string): Promise<string | null> {
  try {
    const r = await fetch(photoUrl(base), { headers: yupooHeaders(referer), cache: "no-store" });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") ?? "image/jpeg";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1024) return null;
    const hash = base.split("/").pop() ?? String(Date.now());
    const blob = await put(`produtos/yupoo-${hash}.jpg`, buf, {
      access: "public",
      addRandomSuffix: true,
      contentType: ct,
    });
    return blob.url;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const url = String(body.url ?? "");
  const origin = originOf(url);

  // 1) LISTAR: devolve os álbuns (id + título) da categoria — TODAS as páginas
  if (action === "list") {
    if (!/\/categories\/\d+/.test(url) && !/\/albums\//.test(url)) {
      return NextResponse.json({ error: "Cole a URL de uma categoria do Yupoo." }, { status: 400 });
    }
    try {
      const seen = new Set<string>();
      const collected: { id: string; title: string }[] = [];
      for (let page = 1; page <= 60; page++) {
        const pageUrl = (() => {
          try {
            const u = new URL(url);
            u.searchParams.set("page", String(page));
            return u.toString();
          } catch {
            return `${url}${url.includes("?") ? "&" : "?"}page=${page}`;
          }
        })();
        const res = await fetch(pageUrl, { headers: yupooHeaders(`${origin}/`), cache: "no-store" });
        const html = await res.text();
        const pageAlbums = parseCategory(html);
        const fresh = pageAlbums.filter((a) => !seen.has(a.id));
        if (fresh.length === 0) break; // acabou (ou repetiu a última página)
        for (const a of fresh) {
          seen.add(a.id);
          collected.push(a);
        }
      }
      // remove o que não deve entrar (kids/kit/player/shorts/jacket/treino/...)
      const albums = collected.filter((a) => !shouldSkipTitle(a.title));
      // ordena por TIME (e depois pelo nome) para importar time a time
      const sorted = albums
        .map((a) => ({ a, p: yupooTitleToProduct(a.title) }))
        .sort(
          (x, y) =>
            (x.p.team ?? "zzz").localeCompare(y.p.team ?? "zzz", "pt-BR") ||
            x.p.name.localeCompare(y.p.name, "pt-BR"),
        )
        .map((x) => x.a);
      return NextResponse.json({ ok: true, albums: sorted });
    } catch {
      return NextResponse.json({ error: "Não foi possível ler a categoria." }, { status: 502 });
    }
  }

  // 2) IMPORTAR UM ÁLBUM: baixa 2 fotos, converte o título e cria o produto
  if (action === "one") {
    const id = String(body.id ?? "");
    const title = String(body.title ?? "");
    const teamName = String(body.team ?? "").trim();
    const active = !!body.active;
    if (!id) return NextResponse.json({ error: "Álbum inválido." }, { status: 400 });
    if (shouldSkipTitle(title)) {
      return NextResponse.json({ ok: false, skipped: true, reason: "kit infantil (ignorado)", title });
    }

    try {
      const db = getDb();
      const p = yupooTitleToProduct(title, teamName || undefined);

      // NÃO DUPLICAR: pula se já existe por id do álbum (source_id) ou pelo nome
      const dup = await db
        .select({ id: products.id })
        .from(products)
        .where(or(eq(products.sourceId, id), ilike(products.name, p.name)))
        .limit(1);
      if (dup.length) {
        return NextResponse.json({ ok: false, skipped: true, reason: "já existe", name: p.name, title });
      }

      const albumUrl = `${origin}/albums/${id}?uid=1`;
      const res = await fetch(albumUrl, { headers: yupooHeaders(`${origin}/`), cache: "no-store" });
      const html = await res.text();
      const bases = parseAlbumPhotos(html).slice(0, 2); // frente + verso
      const images: string[] = [];
      for (const b of bases) {
        const u = await reupload(b, `${origin}/`);
        if (u) images.push(u);
      }
      if (images.length === 0) {
        return NextResponse.json({ ok: false, skipped: true, reason: "sem fotos", title });
      }

      const [row] = await db
        .insert(products)
        .values({
          name: p.name,
          team: p.team,
          category: p.category,
          priceCents: p.priceCents,
          compareCents: p.compareCents,
          version: "Torcedor",
          images,
          active,
          inStock: true,
          promo3x2: p.promo3x2,
          feminina: p.feminina,
          infantil: p.infantil,
          sourceId: id,
        })
        .returning({ id: products.id });

      revalidateTag("products", "max");
      return NextResponse.json({
        ok: true,
        id: row?.id,
        name: p.name,
        team: p.team,
        category: p.category,
        images: images.length,
      });
    } catch (e) {
      console.error("import one error", e);
      return NextResponse.json({ ok: false, skipped: true, reason: "erro", title });
    }
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
