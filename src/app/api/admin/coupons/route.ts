import { NextResponse } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const createSchema = z
  .object({
    code: z.string().trim().min(3).max(40),
    type: z.enum(["percent", "fixed"]),
    value: z.number().int().positive(),
    minCents: z.number().int().nonnegative().default(0),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, {
    message: "Percentual deve ser entre 1 e 100.",
    path: ["value"],
  });

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const db = getDb();
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: rows });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const d = parsed.data;
  try {
    const db = getDb();
    await db.insert(coupons).values({
      code: d.code.toUpperCase(),
      type: d.type,
      value: d.value,
      minCents: d.minCents,
      maxUses: d.maxUses ?? null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as { message?: string })?.message ?? "";
    if (/duplicate key|unique/i.test(msg)) {
      return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
    }
    console.error("create coupon error", e);
    return NextResponse.json({ error: "Não foi possível criar o cupom." }, { status: 500 });
  }
}
