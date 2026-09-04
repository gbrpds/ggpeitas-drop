import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, emailVerifications } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { welcomeEmail, verificationCodeEmail } from "@/lib/email-templates";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome").max(80),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(100),
});

/** Exige verificação por código só quando a chave está ligada (domínio de e-mail pronto). */
function verificationRequired() {
  return ["1", "true", "on"].includes((process.env.REQUIRE_EMAIL_VERIFICATION ?? "").toLowerCase());
}

export async function POST(req: Request) {
  const rl = await rateLimit(`reg:${clientIp(req)}`, 5, 3600);
  if (!rl.ok) return tooMany("Muitos cadastros. Tente novamente mais tarde.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const em = email.toLowerCase().trim();

  try {
    const db = getDb();
    const [exists] = await db.select().from(users).where(eq(users.email, em)).limit(1);
    if (exists) {
      return NextResponse.json({ error: "Esse e-mail já está cadastrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // --- Fluxo SEM verificação (padrão até o domínio de e-mail estar pronto) ---
    if (!verificationRequired()) {
      await db.insert(users).values({ name, email: em, passwordHash, provider: "credentials" });
      try {
        const tpl = welcomeEmail(name, new URL(req.url).origin);
        await sendEmail({ to: em, subject: tpl.subject, html: tpl.html });
      } catch (e) {
        console.error("welcome email error", e);
      }
      return NextResponse.json({ ok: true });
    }

    // --- Fluxo COM verificação por código ---
    const code = String(crypto.randomInt(100000, 1000000)); // 6 dígitos
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db
      .insert(emailVerifications)
      .values({ email: em, name, passwordHash, codeHash, expiresAt, attempts: 0 })
      .onConflictDoUpdate({
        target: emailVerifications.email,
        set: { name, passwordHash, codeHash, expiresAt, attempts: 0 },
      });

    const tpl = verificationCodeEmail(name, code);
    const sent = await sendEmail({ to: em, subject: tpl.subject, html: tpl.html });
    if (!sent.ok && !sent.skipped) {
      return NextResponse.json({ error: "Não foi possível enviar o código agora." }, { status: 502 });
    }

    return NextResponse.json({ pending: true });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ error: "Não foi possível criar a conta agora. Tente novamente." }, { status: 500 });
  }
}
