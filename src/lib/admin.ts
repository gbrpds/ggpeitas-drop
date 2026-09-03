import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";

export { adminEmails, isAdminEmail } from "@/lib/admin-emails";

/** True se o usuário logado é um admin autorizado. */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    return isAdminEmail(session?.user?.email);
  } catch {
    return false;
  }
}
