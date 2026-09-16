import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { favorites } from "@/db/schema";
import { resolveUserId } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lista os productIds favoritados do usuário logado. */
export async function GET() {
  const uid = await resolveUserId();
  if (!uid) return NextResponse.json({ ids: [] });
  try {
    const rows = await getDb().select({ productId: favorites.productId }).from(favorites).where(eq(favorites.userId, uid));
    return NextResponse.json({ ids: rows.map((r) => r.productId) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

/** Adiciona aos favoritos. */
export async function POST(req: Request) {
  const uid = await resolveUserId();
  if (!uid) return NextResponse.json({ error: "Entre para favoritar." }, { status: 401 });
  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  try {
    // evita duplicar (não há constraint no drizzle-schema, mas há no banco)
    await getDb().execute(
      sql`insert into favorites (user_id, product_id) values (${uid}, ${productId}) on conflict (user_id, product_id) do nothing`,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  }
}

/** Remove dos favoritos. */
export async function DELETE(req: Request) {
  const uid = await resolveUserId();
  if (!uid) return NextResponse.json({ error: "Entre para favoritar." }, { status: 401 });
  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  try {
    await getDb().delete(favorites).where(and(eq(favorites.userId, uid), eq(favorites.productId, productId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Falha ao remover." }, { status: 500 });
  }
}
