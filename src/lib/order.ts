import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

/** Descobre o id do usuário logado (por e-mail) para vincular ao pedido. */
export async function resolveUserId(): Promise<string | null> {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    if (!email) return null;
    const db = getDb();
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return u?.id ?? null;
  } catch {
    return null;
  }
}
