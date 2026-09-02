import { NextResponse } from "next/server";
import { syncPaymentStatus } from "@/lib/mp";

export const runtime = "nodejs";

/** Consulta o status de um pagamento e sincroniza o pedido (usado pelo polling). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId ausente" }, { status: 400 });

  try {
    const status = await syncPaymentStatus(paymentId);
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o pagamento." }, { status: 502 });
  }
}
