import Link from "next/link";
import type { Metadata } from "next";
import { baseUrl } from "@/lib/site-url";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Camisas de Futebol Importadas (Tailandesas 1:1)",
  description:
    "Guia completo das camisas de futebol importadas: o que é a qualidade tailandesa 1:1, por que valem a pena, como comprar com segurança e onde encontrar seu time.",
  alternates: { canonical: "/camisas-importadas" },
};

const times = [
  ["Flamengo", "flamengo"],
  ["Palmeiras", "palmeiras"],
  ["Corinthians", "corinthians"],
  ["São Paulo", "sao-paulo"],
  ["Real Madrid", "real-madrid"],
  ["Barcelona", "barcelona"],
  ["Manchester United", "manchester-united"],
  ["PSG", "psg"],
];

export default function CamisasImportadasPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: baseUrl() },
      { "@type": "ListItem", position: 2, name: "Camisas Importadas", item: `${baseUrl()}/camisas-importadas` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <nav className="crumbs" aria-label="Caminho">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Camisas Importadas</span>
          </nav>

          <h1 className="blog-title">Camisas de Futebol Importadas</h1>
          <p className="cat-intro">
            As <strong>camisas de futebol importadas</strong> entregam o visual e a pegada das
            oficiais por uma fração do preço. Aqui você entende tudo sobre a chamada
            <strong> qualidade tailandesa 1:1</strong> e encontra o modelo do seu time.
          </p>

          <div className="blog-body">
            <h2>O que são camisas importadas?</h2>
            <p>
              São réplicas de alta qualidade produzidas no exterior, com tecido dry-fit, escudo
              bordado e detalhes muito próximos da peça oficial. O padrão mais buscado é a
              <strong> versão 1:1</strong> (um pra um), difícil de distinguir da original.
            </p>

            <h2>Por que valem a pena</h2>
            <ul>
              <li><strong>Preço justo:</strong> bem mais em conta que a loja oficial.</li>
              <li><strong>Variedade:</strong> times e temporadas que nem sempre chegam ao Brasil.</li>
              <li><strong>Qualidade 1:1:</strong> acabamento premium, com bordado e caimento corretos.</li>
            </ul>

            <h2>Explore por coleção</h2>
            <p>
              Navegue pelas nossas coleções: <Link href="/categoria/brasileirao">Brasileirão</Link>,{" "}
              <Link href="/categoria/europa">clubes europeus</Link>,{" "}
              <Link href="/categoria/selecoes">seleções</Link>,{" "}
              <Link href="/categoria/retro">retrôs</Link>,{" "}
              <Link href="/categoria/mundo">MLS e Liga Argentina</Link> e{" "}
              <Link href="/categoria/feminina">femininas</Link>.
            </p>

            <h2>Times mais procurados</h2>
            <p className="ci-times">
              {times.map(([nome, slug]) => (
                <Link key={slug} href={`/time/${slug}`} className="ci-time">
                  Camisas do {nome}
                </Link>
              ))}
            </p>

            <h2>Como comprar com segurança</h2>
            <p>
              Prefira lojas com fotos reais, atendimento ativo e política clara de troca. Na
              <strong> GG Peitas</strong> o envio é direto do fornecedor (prazo de 3 a 4 semanas),
              com frete para todo o Brasil e até 3x sem juros. Veja as{" "}
              <Link href="/faq">perguntas frequentes</Link>, a{" "}
              <Link href="/trocas">política de trocas</Link> ou leia nosso{" "}
              <Link href="/blog">blog</Link> com guias completos.
            </p>

            <p>
              Não achou o modelo que procura? <Link href="/solicitar">Solicite sua camisa</Link> que
              a gente busca pra você.
            </p>
          </div>
        </article>
      </main>
      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
