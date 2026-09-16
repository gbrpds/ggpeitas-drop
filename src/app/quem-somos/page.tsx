import Link from "next/link";
import type { Metadata } from "next";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "Conheça a GG Peitas, loja de camisas de futebol importadas premium (qualidade tailandesa 1:1), com clubes e seleções do mundo todo e entrega para todo o Brasil.",
  alternates: { canonical: "/quem-somos" },
};

export default function QuemSomos() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <h1>Quem somos</h1>
          <div className="blog-body">
            <p>
              A <strong>GG Peitas</strong> nasceu da paixão pelo futebol e pelo estilo que uma boa camisa carrega.
              Somos uma loja especializada em <strong>camisas de futebol importadas</strong> de alta qualidade, o
              padrão conhecido como <strong>tailandesa 1:1</strong>, reunindo clubes e seleções do mundo todo, em
              versões atuais e <strong>retrô</strong>.
            </p>
            <h2>Nossa missão</h2>
            <p>
              Levar o manto do seu time até você com qualidade premium e preço justo, sem complicação. Selecionamos
              cada modelo com cuidado e mostramos <strong>fotos reais</strong> dos produtos.
            </p>
            <h2>Por que comprar com a gente</h2>
            <ul>
              <li>Camisas premium (qualidade 1:1) de <Link href="/categoria/brasileirao">Brasileirão</Link>, <Link href="/categoria/europa">Europa</Link>, MLS, Liga Argentina, <Link href="/categoria/retro">Retrôs</Link> e <Link href="/categoria/selecoes">Seleções</Link>.</li>
              <li>Frete grátis acima de R$299 e até 3x sem juros.</li>
              <li>Atendimento próximo, não achou o modelo? <Link href="/solicitar">A gente busca pra você</Link>.</li>
            </ul>
          </div>
          <div className="blog-cta">
            <p>Vista a sua paixão com a GG Peitas.</p>
            <Link className="btn btn-g" href="/">Ver a loja</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
