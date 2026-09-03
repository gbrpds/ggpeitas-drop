import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  team: z.string().optional().nullable(),
  category: z.string().min(1, "Escolha a categoria"),
  priceCents: z.number().int().positive("Preço inválido"),
  compareCents: z.number().int().positive().optional().nullable(),
  version: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [row] = await db.insert(products).values(parsed.data).returning({ id: products.id });
    return NextResponse.json({ ok: true, id: row?.id });
  } catch (e) {
    console.error("create product error", e);
    return NextResponse.json({ error: "Não foi possível salvar o produto." }, { status: 500 });
  }
}
