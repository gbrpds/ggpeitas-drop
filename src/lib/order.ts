import { eq, like, and, lt } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users, orders } from "@/db/schema";

type Db = ReturnType<typeof getDb>;

/** Tempo máximo que um pedido fica "em aberto" antes de cancelar (10 min). */
export const ORDER_TTL_MS = 10 * 60 * 1000;

/** Pedido pendente que já passou dos 10 min (tratado como cancelado na leitura). */
export function isExpiredPending(o: { status: string; createdAt: Date | string }): boolean {
  return (
    o.status === "pending" &&
    Date.now() - new Date(o.createdAt).getTime() > ORDER_TTL_MS
  );
}

/** Status "efetivo": pendente expirado vira cancelado mesmo antes do carimbo no banco. */
export function effectiveStatus(o: { status: string; createdAt: Date | string }): string {
  return isExpiredPending(o) ? "cancelled" : o.status;
}

/** Cancela pedidos "em aberto" há mais de 10 minutos (expiração no servidor). */
export async function expireStaleOrders(db: Db): Promise<void> {
  const cutoff = new Date(Date.now() - ORDER_TTL_MS);
  try {
    await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(and(eq(orders.status, "pending"), lt(orders.createdAt, cutoff)));
  } catch (e) {
    console.error("expireStaleOrders error", e);
  }
}

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

/** Carrega um pedido que pertence ao usuário logado (ou null). */
export async function getOwnedOrder(id: string) {
  try {
    const uid = await resolveUserId();
    if (!uid) return null;
    const db = getDb();
    const [o] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, uid)))
      .limit(1);
    return o ?? null;
  } catch {
    return null;
  }
}

/** Carrega um pedido pelo id, sem checar dono (uso interno/pós-pagamento). */
export async function getOrderById(id: string) {
  try {
    const db = getDb();
    const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return o ?? null;
  } catch {
    return null;
  }
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
