import { Suspense } from "react";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata = { title: "Nova senha — GG Peitas" };

export default function NovaSenhaPage() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="auth-wrap wrap">
          <h1 className="auth-title">Criar nova senha</h1>
          <Suspense fallback={<div className="auth-card">Carregando…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
