import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { baseUrl } from "@/lib/site-url";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email().max(160) });

/** Solicita redefinição de senha: gera token, envia e-mail. Não revela se o e-mail existe. */
export async function POST(req: Request) {
  const rl = await rateLimit(`forgot:${clientIp(req)}`, 5, 900);
  if (!rl.ok) return tooMany("Muitas tentativas. Tente novamente em alguns minutos.");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  const em = parsed.data.email.toLowerCase().trim();

  try {
    const db = getDb();
    const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, em)).limit(1);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
      // limpa tokens antigos desse e-mail e grava o novo
      await db.delete(passwordResets).where(eq(passwordResets.email, em));
      await db.insert(passwordResets).values({ tokenHash, email: em, expiresAt });

      const url = `${baseUrl()}/nova-senha?token=${rawToken}`;
      const tpl = passwordResetEmail(user.name ?? "", url);
      await sendEmail({ to: em, subject: tpl.subject, html: tpl.html });
    }
    // resposta idêntica exista ou não o e-mail (evita enumeração de contas)
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("forgot password error", e);
    return NextResponse.json({ ok: true }); // não vaza erro/inexistência
  }
}
