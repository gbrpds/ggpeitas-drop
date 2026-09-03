import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { teams } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2, "Informe o nome do time"),
  colors: z.array(z.string()).length(3).optional(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const { name, colors } = parsed.data;

  try {
    const db = getDb();
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${teams.sort}), 0)` }).from(teams);
    const [row] = await db
      .insert(teams)
      .values({ name: name.trim(), colors: colors ?? ["#0f8a3d", "#ffc400", "#ffffff"], sort: (max ?? 0) + 1 })
      .returning({ id: teams.id });
    return NextResponse.json({ ok: true, id: row?.id });
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Esse time já existe." }, { status: 409 });
    }
    console.error("create team error", e);
    return NextResponse.json({ error: "Não foi possível adicionar o time." }, { status: 500 });
  }
}
