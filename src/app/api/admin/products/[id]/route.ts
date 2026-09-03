import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

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
