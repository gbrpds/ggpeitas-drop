import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { resolveUserId } from "@/lib/order";
import { getProfile } from "@/lib/account";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AccountDataForm } from "@/components/account/AccountDataForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus dados — GG Peitas" };

export default async function MeusDadosPage() {
  const userId = await resolveUserId();
  if (!userId) redirect("/conta?next=/conta/dados");
  const profile = await getProfile(userId);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="auth-wrap wrap" style={{ maxWidth: 640 }}>
          <Link className="adm-back" href="/conta"><ArrowLeft size={16} /> Voltar para a conta</Link>
          <h1 className="page-title">Meus dados</h1>
          <p className="auth-lead">
            Seu endereço padrão é usado automaticamente nas próximas compras (você pode trocar na hora do checkout).
          </p>
          {profile && (
            <AccountDataForm
              initial={{
                name: profile.name,
                email: profile.email,
                cpf: profile.cpf,
                phone: profile.phone,
                address: profile.address,
              }}
            />
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
