import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { RequestForm } from "@/components/RequestForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Solicite sua camisa — GG Peitas",
  description: "Não achou a camisa que procurava? Faça o pedido e a gente busca pra você.",
};

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap req-page">
          <h1 className="search-title">Solicite sua camisa</h1>
          <p className="auth-lead">
            Não encontrou o que procurava? Conta pra gente qual camisa você quer — pode ser de qualquer
            time, temporada ou versão. Nós buscamos com nossos fornecedores e te retornamos com preço e
            prazo. Se tiver uma <b>foto do modelo</b>, anexe que fica ainda mais fácil de localizar. 💚
          </p>
          <RequestForm defaultQuery={q} />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
