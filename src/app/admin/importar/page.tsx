import Link from "next/link";
import { Lock } from "lucide-react";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { YupooImport } from "@/components/admin/YupooImport";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Importar — GG Peitas" };

export default async function ImportarPage() {
  const ok = await isAdmin();
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          {!ok ? (
            <div className="cart-empty"><Lock strokeWidth={1.5} /><h2>Acesso restrito</h2><Link className="btn btn-g" href="/conta">Entrar</Link></div>
          ) : (
            <>
              <AdminNav />
              <h1 className="page-title">Importar do Yupoo</h1>
              <p className="auth-lead">
                Cole a URL da página do time no Yupoo e digite o nome do time. As fotos (frente e verso)
                são baixadas para a nossa loja e o título é convertido para o padrão PT, já na categoria certa.
              </p>
              <YupooImport />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
