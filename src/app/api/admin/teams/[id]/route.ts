import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { teams } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  try {
    const db = getDb();
    await db.delete(teams).where(eq(teams.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete team error", e);
    return NextResponse.json({ error: "Falha ao excluir." }, { status: 500 });
  }
}

const patchSchema = z.object({ crestUrl: z.string().url().nullable() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  try {
    const db = getDb();
    await db.update(teams).set({ crestUrl: parsed.data.crestUrl }).where(eq(teams.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("patch team error", e);
    return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  }
}
