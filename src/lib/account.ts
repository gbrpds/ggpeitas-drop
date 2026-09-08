import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export type Address = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
};

export type Profile = {
  name: string | null;
  email: string;
  cpf: string | null;
  phone: string | null;
  address: Address | null;
};

/** Perfil do usuário (dados padrão que pré-preenchem o checkout). */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const db = getDb();
    const [u] = await db
      .select({ name: users.name, email: users.email, cpf: users.cpf, phone: users.phone, address: users.address })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!u) return null;
    return { ...u, address: (u.address as Address | null) ?? null };
  } catch {
    return null;
  }
}

/** Salva os dados padrão (endereço/telefone/cpf) — usado no "Meus dados". */
export async function saveProfile(
  userId: string,
  data: { cpf?: string | null; phone?: string | null; address?: Address | null },
): Promise<void> {
  const db = getDb();
  await db.update(users).set(data).where(eq(users.id, userId));
}

/**
 * Grava o endereço/dados da compra como padrão (última compra vira o padrão).
 * Best-effort: não lança se falhar.
 */
export async function setDefaultFromOrder(
  userId: string | null,
  customer: { cpf?: string; phone?: string },
  address: Address,
): Promise<void> {
  if (!userId) return;
  try {
    await getDb()
      .update(users)
      .set({ cpf: customer.cpf ?? null, phone: customer.phone ?? null, address })
      .where(eq(users.id, userId));
  } catch (e) {
    console.error("setDefaultFromOrder error", e);
  }
}
