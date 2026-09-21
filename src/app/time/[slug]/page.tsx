import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getAllActive } from "@/lib/catalog";
import { baseUrl } from "@/lib/site-url";
import { teamSlug } from "@/lib/team-slug";
import { seasonScore } from "@/lib/facets";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

/** slug -> nome canônico do time (a partir dos produtos ativos). */
async function resolveTeam(slug: string): Promise<{ team: string; products: Awaited<ReturnType<typeof getAllActive>> } | null> {
  const all = await getAllActive();
  const map = new Map<string, string>(); // slug -> team (primeiro que aparecer)
  for (const p of all) if (p.team && !map.has(teamSlug(p.team))) map.set(teamSlug(p.team), p.team);
  const team = map.get(slug);
  if (!team) return null;
  const products = all.filter((p) => p.team === team).sort((a, b) => seasonScore(b.name) - seasonScore(a.name));
  return { team, products };
}

export async function generateStaticParams() {
  try {
    const all = await getAllActive();
    const slugs = new Set<string>();
    for (const p of all) if (p.team) slugs.add(teamSlug(p.team));
    return [...slugs].map((slug) => ({ slug }));
  } catch {
    return []; // banco indisponível no build → páginas geram sob demanda (ISR)
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await resolveTeam(slug);
  if (!data) return { title: "Time não encontrado" };
  const { team, products } = data;
  return {
    title: `Camisas do ${team} Importadas`,
    description: `Camisas do ${team} importadas com qualidade 1:1: versões atuais e retrô, masculina e feminina. ${products.length} modelos, frete para todo o Brasil e até 3x sem juros.`,
    alternates: { canonical: `/time/${slug}` },
  };
}

export default async function TimePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const data = await resolveTeam(slug);
  if (!data) notFound();
  const { team, products } = data;

  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageItems = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (p: number) => (p > 1 ? `/time/${slug}?page=${p}` : `/time/${slug}`);

  const temRetro = products.some((p) => /retr[ôo]/i.test(p.name) || p.category === "retro");
  const temFem = products.some((p) => /\(feminin/i.test(p.name));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: baseUrl() },
      { "@type": "ListItem", position: 2, name: `Camisas do ${team}`, item: `${baseUrl()}/time/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap search-page">
          <nav className="crumbs" aria-label="Caminho">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Camisas do {team}</span>
          </nav>

          <h1 className="search-title">
            Camisas do {team}
            <span>{products.length} {products.length === 1 ? "modelo" : "modelos"}</span>
          </h1>

          <p className="cat-intro">
            Encontre as <strong>camisas do {team} importadas</strong> com qualidade tailandesa 1:1:
            escudo bordado, tecido dry-fit e acabamento muito próximo da oficial.
            {temRetro ? " Tem versão atual e também os retrôs que marcaram época." : ""}
            {temFem ? " Disponível em modelagem masculina e feminina." : ""} Frete para todo o
            Brasil e até 3x sem juros. Não achou o modelo? <Link href="/solicitar">Solicite sua camisa</Link>.
          </p>

          {products.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag strokeWidth={1.5} />
              <h2>Em breve por aqui</h2>
              <Link className="btn btn-g" href="/">Voltar à loja</Link>
            </div>
          ) : (
            <>
              <div className="cat-grid">
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} hrefFor={pageHref} />
            </>
          )}
        </div>
      </main>
      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
