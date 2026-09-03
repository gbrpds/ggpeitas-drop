import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { teamCrests } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const schema = z.object({ name: z.string().min(1), crestUrl: z.string().url().nullable() });

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const { name, crestUrl } = parsed.data;

  try {
    const db = getDb();
    if (!crestUrl) {
      await db.delete(teamCrests).where(eq(teamCrests.name, name));
      return NextResponse.json({ ok: true, removed: true });
    }
    await db
      .insert(teamCrests)
      .values({ name, crestUrl })
      .onConflictDoUpdate({ target: teamCrests.name, set: { crestUrl, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("team-crest error", e);
    return NextResponse.json({ error: "Falha ao salvar o escudo." }, { status: 500 });
  }
}
