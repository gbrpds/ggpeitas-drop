import { auth } from "@/auth";

/** E-mails autorizados a acessar o admin (variável ADMIN_EMAILS, separados por vírgula). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True se o usuário logado é um admin autorizado. */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    return !!email && adminEmails().includes(email);
  } catch {
    return false;
  }
}
