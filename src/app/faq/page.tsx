import Link from "next/link";
import type { Metadata } from "next";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Perguntas frequentes (FAQ)",
  description: "Tire suas dúvidas sobre camisas importadas, qualidade tailandesa 1:1, tamanhos, prazo de entrega, frete, pagamento e trocas na GG Peitas.",
  alternates: { canonical: "/faq" },
};

const faqs: { q: string; a: string; html?: string }[] = [
  { q: "As camisas são importadas? Qual a qualidade?", a: "Sim. Trabalhamos com camisas importadas premium, no padrão conhecido como tailandesa 1:1, tecido dry-fit, escudo bordado e acabamento muito próximo da versão oficial." },
  { q: "Qual o prazo de entrega?", a: "Como o envio é direto do fornecedor, o prazo costuma ser de 3 a 4 semanas. O prazo exato aparece no acompanhamento do pedido; você recebe atualizações por e-mail a cada etapa." },
  { q: "Como escolho o tamanho certo?", a: "As importadas vestem um pouco mais justo que o padrão brasileiro. Consulte a tabela de medidas na página do produto e, na dúvida entre dois tamanhos, suba um." },
  { q: "Quais as formas de pagamento?", a: "Aceitamos PIX, cartão (Visa, Master, Elo) em até 3x sem juros e boleto, tudo pelo Mercado Pago, compra 100% segura." },
  { q: "Tem frete grátis?", a: "Sim, o frete é grátis para compras acima de R$299. Abaixo disso, o valor é calculado no checkout conforme o seu CEP." },
  {
    q: "Não achei a camisa que queria. E agora?",
    a: "Sem problema! Use a página Solicitar sua camisa, descreva o modelo (pode anexar foto) e a gente busca com nossos fornecedores, retornando com preço e prazo.",
    html: 'Sem problema! Use a página <a href="/solicitar" class="lnk-green">Solicitar sua camisa</a>, descreva o modelo (pode anexar foto) e a gente busca com nossos fornecedores, retornando com preço e prazo.',
  },
  { q: "Posso trocar ou devolver?", a: "Como as compras são enviadas direto da China, por causa do tempo de entrega, as trocas e devoluções são feitas somente quando o produto apresenta falhas. Por isso, recomendamos conferir bem o tamanho antes de comprar." },
];

export default function FAQ() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <h1>Perguntas frequentes</h1>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                {f.html ? <p dangerouslySetInnerHTML={{ __html: f.html }} /> : <p>{f.a}</p>}
              </details>
            ))}
          </div>
          <div className="blog-cta">
            <p>Ainda com dúvidas? Fale com a gente.</p>
            <Link className="btn btn-g" href="/contato">Entrar em contato</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
