import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { notifyBackInStock } from "@/lib/stock";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  team: z.string().optional().nullable(),
  category: z.string().min(1, "Escolha a categoria"),
  priceCents: z.number().int().positive("Preço inválido"),
  compareCents: z.number().int().positive().optional().nullable(),
  version: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  active: z.boolean().default(true),
  inStock: z.boolean().default(true),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  try {
    const db = getDb();
    const [prev] = await db
      .select({ inStock: products.inStock })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    await db.update(products).set(parsed.data).where(eq(products.id, id));
    // voltou ao estoque → avisa os inscritos
    if (parsed.data.inStock && prev && !prev.inStock) {
      await notifyBackInStock(id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("update product error", e);
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  try {
    const db = getDb();
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete product error", e);
    return NextResponse.json({ error: "Falha ao excluir." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const db = getDb();
    const patch: Record<string, unknown> = {};
    if ("active" in body) patch.active = !!body.active;
    if ("inStock" in body) patch.inStock = !!body.inStock;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
    }

    let notify = false;
    if ("inStock" in body && patch.inStock === true) {
      const [prev] = await db
        .select({ inStock: products.inStock })
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
      notify = !!prev && !prev.inStock; // transição sem estoque → disponível
    }

    await db.update(products).set(patch).where(eq(products.id, id));
    if (notify) await notifyBackInStock(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("patch product error", e);
    return NextResponse.json({ error: "Falha ao atualizar." }, { status: 500 });
  }
}
