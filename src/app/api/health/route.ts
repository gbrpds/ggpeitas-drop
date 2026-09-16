import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // nunca cacheia: sempre bate no banco p/ aquecê-lo

/**
 * Health check / "keep-warm": faz um SELECT 1 para acordar o Neon (que suspende
 * após inatividade). Um cron/monitor externo chamando isto a cada ~5 min mantém
 * o banco quente, eliminando a lentidão do "site frio".
 */
export async function GET() {
  const started = Date.now();
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json(
      { ok: true, ms: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, ms: Date.now() - started },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
