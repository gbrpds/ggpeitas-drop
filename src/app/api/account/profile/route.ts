import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveUserId } from "@/lib/order";
import { saveProfile } from "@/lib/account";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  cpf: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z
    .object({
      cep: z.string().trim().max(10),
      rua: z.string().trim().max(120),
      numero: z.string().trim().max(20),
      bairro: z.string().trim().max(80),
      cidade: z.string().trim().max(80),
      uf: z.string().trim().max(2),
      complemento: z.string().trim().max(80).optional(),
    })
    .nullable()
    .optional(),
});

/** Atualiza os dados padrão do cliente (endereço/telefone/CPF). */
export async function POST(req: Request) {
  const rl = await rateLimit(`profile:${clientIp(req)}`, 20, 600);
  if (!rl.ok) return tooMany();

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Entre na sua conta." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  try {
    await saveProfile(userId, {
      cpf: parsed.data.cpf?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      address: parsed.data.address ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("save profile error", e);
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }
}
