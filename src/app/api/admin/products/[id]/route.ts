import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

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
    await db.update(products).set(parsed.data).where(eq(products.id, id));
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
    await db.update(products).set({ active: !!body.active }).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("patch product error", e);
    return NextResponse.json({ error: "Falha ao atualizar." }, { status: 500 });
  }
}
