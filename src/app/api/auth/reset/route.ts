import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(100),
});

/** Confirma o token e define a nova senha. */
export async function POST(req: Request) {
  const rl = await rateLimit(`reset:${clientIp(req)}`, 10, 900);
  if (!rl.ok) return tooMany("Muitas tentativas. Tente novamente em alguns minutos.");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  try {
    const db = getDb();
    const [row] = await db.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHash)).limit(1);
    if (!row || row.expiresAt.getTime() < Date.now()) {
      if (row) await db.delete(passwordResets).where(eq(passwordResets.tokenHash, tokenHash));
      return NextResponse.json({ error: "Link inválido ou expirado. Solicite um novo." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.email, row.email));
    await db.delete(passwordResets).where(eq(passwordResets.email, row.email));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reset password error", e);
    return NextResponse.json({ error: "Não foi possível redefinir agora." }, { status: 500 });
  }
}
