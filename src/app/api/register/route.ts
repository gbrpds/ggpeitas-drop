import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome").max(80),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
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
    await db.insert(users).values({ name, email: em, passwordHash, provider: "credentials" });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json(
      { error: "Não foi possível criar a conta agora. Tente novamente." },
      { status: 500 },
    );
  }
}
