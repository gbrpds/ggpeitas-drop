import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { orderShippedEmail } from "@/lib/email-templates";
import { correiosLink } from "@/lib/correios";
import { baseUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type Customer = { name?: string; email?: string };

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
    const db = getDb();
    // estado anterior (para disparar o e-mail só na transição para "enviado")
    const [prev] = await db
      .select({
        number: orders.number,
        customer: orders.customer,
        trackingCode: orders.trackingCode,
        shippingStatus: orders.shippingStatus,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    await db.update(orders).set(patch).where(eq(orders.id, id));

    // valores após o patch
    const newStage = "shippingStatus" in patch ? (patch.shippingStatus as string | null) : prev?.shippingStatus ?? null;
    const newCode = "trackingCode" in patch ? (patch.trackingCode as string | null) : prev?.trackingCode ?? null;
    const becameShipped = newStage === "enviado" && prev?.shippingStatus !== "enviado";

    if (becameShipped && newCode) {
      const c = (prev?.customer as Customer) ?? {};
      if (c.email) {
        const tpl = orderShippedEmail({
          number: prev?.number ?? null,
          customerName: c.name,
          trackingCode: newCode,
          trackingUrl: correiosLink(newCode),
          orderUrl: `${baseUrl()}/pedido/${id}`,
        });
        await sendEmail({ to: c.email, subject: tpl.subject, html: tpl.html });
      }
    }
  } catch (e) {
    console.error("update order tracking error", e);
    return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
