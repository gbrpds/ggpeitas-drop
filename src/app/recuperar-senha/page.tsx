import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata = { title: "Recuperar senha — GG Peitas" };

export default function RecuperarSenhaPage() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="auth-wrap wrap">
          <h1 className="auth-title">Recuperar senha</h1>
          <p className="auth-lead">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
          <ForgotForm />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
