import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { teams } from "@/db/schema";

export const runtime = "nodejs";

/** Lista pública de times (nome, cores, escudo) para o modal de time. */
export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(teams).orderBy(asc(teams.sort), asc(teams.name));
    return NextResponse.json(
      rows.map((r) => ({ id: r.id, name: r.name, colors: r.colors, crestUrl: r.crestUrl })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
