import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo produto — GG Peitas" };

export default async function NovoProdutoPage() {
  const ok = await isAdmin();

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap" style={{ maxWidth: 720 }}>
          {!ok ? (
            <div className="cart-empty">
              <Lock strokeWidth={1.5} />
              <h2>Acesso restrito</h2>
              <Link className="btn btn-g" href="/conta">Entrar</Link>
            </div>
          ) : (
            <>
              <Link className="adm-back" href="/admin"><ArrowLeft size={16} /> Voltar aos produtos</Link>
              <h1 className="page-title">Novo produto</h1>
              <AdminProductForm />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
