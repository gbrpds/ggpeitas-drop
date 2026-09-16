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
            <h2>Trocas e devoluções: como funciona</h2>
            <p>
              Como as compras são enviadas direto da China, por causa do tempo de entrega, as trocas e devoluções
              são feitas <strong>somente quando o produto apresenta falhas</strong> (defeito de fabricação). Por isso,
              recomendamos conferir bem o tamanho antes de comprar.
            </p>
            <h2>Produto com defeito</h2>
            <p>
              Se a peça chegar com algum defeito, entre em contato em até <strong>7 dias</strong> após o recebimento
              com fotos do problema. Vamos avaliar e resolver da melhor forma para você.
            </p>
            <h2>Confira o tamanho antes de comprar</h2>
            <p>
              As camisas importadas tendem a vestir um pouco mais justo. Consulte a tabela de medidas na página do
              produto e, na dúvida entre dois tamanhos, suba um. Isso evita a maioria dos problemas de caimento.
            </p>
            <h2>Como solicitar</h2>
            <p>
              É simples: entre em <Link href="/contato">Contato</Link> com o número do pedido e as fotos. Nosso time
              orienta o passo a passo.
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
