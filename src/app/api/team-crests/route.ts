import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { teamCrests } from "@/db/schema";

export const runtime = "nodejs";

/** Mapa público { time: urlDoEscudo } para o modal de time. */
export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(teamCrests);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.name] = r.crestUrl;
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}
