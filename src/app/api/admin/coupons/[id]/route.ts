import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!("active" in body)) return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  try {
    await getDb().update(coupons).set({ active: !!body.active }).where(eq(coupons.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("patch coupon error", e);
    return NextResponse.json({ error: "Falha ao atualizar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  try {
    await getDb().delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete coupon error", e);
    return NextResponse.json({ error: "Falha ao excluir." }, { status: 500 });
  }
}
