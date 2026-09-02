import { eq, like } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users, orders } from "@/db/schema";

type Db = ReturnType<typeof getDb>;

/** Gera o número do pedido no padrão AAAAMM + contador de 4 dígitos (por mês). */
export async function genOrderNumber(db: Db): Promise<string> {
  const now = new Date();
  const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rows = await db
    .select({ number: orders.number })
    .from(orders)
    .where(like(orders.number, `${prefix}%`));
  const seq = rows.length + 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

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
