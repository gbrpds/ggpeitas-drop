import Link from "next/link";
import type { Metadata } from "next";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description: "Política de trocas e devoluções da GG Peitas: prazo de arrependimento, garantia contra defeitos e como solicitar.",
  alternates: { canonical: "/trocas" },
};

export default function Trocas() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <h1>Trocas e devoluções</h1>
          <div className="blog-body">
            <p>Queremos que você fique 100% satisfeito com a sua camisa. Veja como funcionam nossas trocas e devoluções.</p>
            <h2>Direito de arrependimento (7 dias)</h2>
            <p>
              Conforme o Código de Defesa do Consumidor, você pode desistir da compra em até <strong>7 dias corridos</strong>
              após o recebimento, sem necessidade de justificativa. O produto deve estar sem uso, com etiquetas e na
              embalagem original.
            </p>
            <h2>Defeito de fabricação</h2>
            <p>
              Se a peça chegar com algum defeito, entre em contato em até <strong>7 dias</strong> após o recebimento com
              fotos do problema. Faremos a troca ou a devolução do valor.
            </p>
            <h2>Troca de tamanho</h2>
            <p>
              Ficou justa ou folgada? Fale com a gente. Como cada modelo vem do fornecedor, a troca de tamanho depende de
              disponibilidade — por isso, confira a tabela de medidas antes de comprar (na dúvida, suba um tamanho).
            </p>
            <h2>Como solicitar</h2>
            <p>
              É simples: entre em <Link href="/contato">Contato</Link> com o número do pedido e o motivo. Nosso time
              orienta o passo a passo do envio e da restituição.
            </p>
          </div>
          <div className="blog-cta">
            <p>Precisa resolver algo com seu pedido?</p>
            <Link className="btn btn-g" href="/contato">Falar com a gente</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
