import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, emailVerifications } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Código inválido."),
});

const MAX_ATTEMPTS = 5;

/** Confirma o código enviado por e-mail e cria a conta de fato. */
export async function POST(req: Request) {
  const rl = await rateLimit(`verify:${clientIp(req)}`, 12, 600);
  if (!rl.ok) return tooMany("Muitas tentativas. Aguarde um pouco.");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const em = parsed.data.email.toLowerCase().trim();

  try {
    const db = getDb();
    const [v] = await db.select().from(emailVerifications).where(eq(emailVerifications.email, em)).limit(1);
    if (!v) return NextResponse.json({ error: "Solicite um novo código." }, { status: 400 });

    if (v.expiresAt.getTime() < Date.now()) {
      await db.delete(emailVerifications).where(eq(emailVerifications.email, em));
      return NextResponse.json({ error: "Código expirado. Cadastre-se novamente." }, { status: 400 });
    }
    if (v.attempts >= MAX_ATTEMPTS) {
      await db.delete(emailVerifications).where(eq(emailVerifications.email, em));
      return NextResponse.json({ error: "Muitas tentativas. Cadastre-se novamente." }, { status: 429 });
    }

    const okCode = await bcrypt.compare(parsed.data.code, v.codeHash);
    if (!okCode) {
      await db
        .update(emailVerifications)
        .set({ attempts: v.attempts + 1 })
        .where(eq(emailVerifications.email, em));
      return NextResponse.json({ error: "Código incorreto." }, { status: 400 });
    }

    // não recria se já existe (corrida)
    const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, em)).limit(1);
    if (!exists) {
      await db.insert(users).values({
        name: v.name,
        email: em,
        passwordHash: v.passwordHash,
        provider: "credentials",
      });
    }
    await db.delete(emailVerifications).where(eq(emailVerifications.email, em));

    try {
      const tpl = welcomeEmail(v.name, new URL(req.url).origin);
      await sendEmail({ to: em, subject: tpl.subject, html: tpl.html });
    } catch (e) {
      console.error("welcome email error", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("verify error", e);
    return NextResponse.json({ error: "Não foi possível verificar agora." }, { status: 500 });
  }
}
