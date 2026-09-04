import { NextResponse } from "next/server";
import crypto from "crypto";
import { syncPaymentStatus } from "@/lib/mp";

export const runtime = "nodejs";

/**
 * Valida a assinatura do webhook do Mercado Pago (se o segredo estiver configurado).
 * Formato: header x-signature = "ts=<ts>,v1=<hash>"; manifesto:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 */
function verifySignature(req: Request, dataId: string | null): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // fail-closed em produção: sem segredo configurado, recusa a notificação.
    // Em dev/preview, deixa passar para facilitar os testes.
    if (process.env.NODE_ENV === "production") {
      console.error("MP_WEBHOOK_SECRET ausente em produção — webhook recusado.");
      return false;
    }
    return true;
  }

  const sig = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id") ?? "";
  if (!sig || !dataId) return false;

  const parts = Object.fromEntries(
    sig.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string]),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({} as any));

  const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (!verifySignature(req, paymentId ? String(paymentId) : null)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  try {
    if ((type === "payment" || type === "payment.updated") && paymentId) {
      await syncPaymentStatus(String(paymentId));
    }
  } catch (e) {
    console.error("webhook mp error", e);
  }

  // Sempre 200 rápido para o MP não reenviar em loop.
  return NextResponse.json({ received: true });
}

// O Mercado Pago faz um GET de teste ao cadastrar a URL.
export async function GET() {
  return NextResponse.json({ ok: true });
}
