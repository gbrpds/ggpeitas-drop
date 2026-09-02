import Link from "next/link";
import { LogOut, User as UserIcon, Package, MapPin } from "lucide-react";
import { auth, signOut, googleEnabled } from "@/auth";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  // Se as variáveis de ambiente ainda não estão configuradas, não quebra a página:
  // apenas trata como deslogado e mostra o formulário.
  let user: { name?: string | null; email?: string | null } | undefined;
  try {
    const session = await auth();
    user = session?.user;
  } catch {
    user = undefined;
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />

      <main>
        <div className="auth-wrap wrap">
          {user ? (
            <div className="account">
              <div className="account-head">
                <div className="account-avatar">
                  <UserIcon strokeWidth={1.8} />
                </div>
                <div>
                  <h1>Olá, {user.name?.split(" ")[0] ?? "torcedor"}!</h1>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="account-grid">
                <Link className="account-card" href="/pedidos">
                  <Package strokeWidth={1.8} />
                  <b>Meus pedidos</b>
                  <span>Acompanhe suas compras</span>
                </Link>
                <Link className="account-card" href="/rastrear">
                  <MapPin strokeWidth={1.8} />
                  <b>Rastrear pedido</b>
                  <span>Veja onde está sua camisa</span>
                </Link>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="account-logout" type="submit">
                  <LogOut size={17} /> Sair da conta
                </button>
              </form>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Minha conta</h1>
              <p className="auth-lead">Entre para acompanhar seus pedidos ou crie sua conta em segundos.</p>
              <AuthForm googleEnabled={googleEnabled} />
            </>
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
