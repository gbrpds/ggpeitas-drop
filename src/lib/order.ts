import { eq, like, and, lt } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users, orders } from "@/db/schema";
import type { NewOrder } from "@/db/schema";

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

/** Gera o número do pedido no padrão AAAAMM + sequência de 4 dígitos (por mês). */
export async function genOrderNumber(db: Db): Promise<string> {
  const now = new Date();
  const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rows = await db
    .select({ number: orders.number })
    .from(orders)
    .where(like(orders.number, `${prefix}%`));
  // usa o MAIOR sufixo existente + 1 (robusto a exclusões, ao contrário de count)
  let maxSeq = 0;
  for (const r of rows) {
    const seq = Number((r.number ?? "").slice(prefix.length));
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

function isUniqueViolation(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /duplicate key|unique constraint|23505/i.test(msg);
}

/**
 * Cria o pedido gerando um `number` único, com retry caso duas requisições
 * peguem o mesmo número ao mesmo tempo (a coluna `number` é UNIQUE no banco).
 */
export async function createOrder(
  db: Db,
  base: Omit<NewOrder, "number">,
): Promise<{ id: string; number: string }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const number = await genOrderNumber(db);
    try {
      const [row] = await db
        .insert(orders)
        .values({ ...base, number })
        .returning({ id: orders.id });
      return { id: row.id, number };
    } catch (e) {
      if (isUniqueViolation(e) && attempt < 5) continue; // colisão → tenta o próximo número
      throw e;
    }
  }
  throw new Error("Não foi possível gerar o número do pedido.");
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
