import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const bodySchema = z.object({
  trackingCode: z.string().trim().max(60).nullable().optional(),
  shippingStatus: z.enum(["preparando", "enviado", "entregue"]).nullable().optional(),
});

/** Atualiza rastreio/etapa de envio de um pedido (somente admin). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if ("trackingCode" in parsed.data) {
    const tc = parsed.data.trackingCode?.trim() ?? "";
    patch.trackingCode = tc ? tc.toUpperCase() : null;
  }
  if ("shippingStatus" in parsed.data) {
    patch.shippingStatus = parsed.data.shippingStatus ?? null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  try {
    await getDb().update(orders).set(patch).where(eq(orders.id, id));
  } catch (e) {
    console.error("update order tracking error", e);
    return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
