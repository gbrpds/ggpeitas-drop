import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getAllActive } from "@/lib/catalog";
import { baseUrl } from "@/lib/site-url";
import { teamSlug } from "@/lib/team-slug";
import { genderOf, modeloOf, GENDER_LABEL, seasonScore } from "@/lib/facets";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

/** slug -> nome canônico do time (a partir dos produtos ativos). */
async function resolveTeam(slug: string): Promise<{ team: string; products: Awaited<ReturnType<typeof getAllActive>> } | null> {
  const all = await getAllActive();
  const map = new Map<string, string>();
  for (const p of all) if (p.team && !map.has(teamSlug(p.team))) map.set(teamSlug(p.team), p.team);
  const team = map.get(slug);
  if (!team) return null;
  const products = all.filter((p) => p.team === team).sort((a, b) => seasonScore(b.name) - seasonScore(a.name));
  return { team, products };
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
  searchParams: Promise<{ gender?: string; tipo?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const data = await resolveTeam(slug);
  if (!data) notFound();
  const { team, products: all } = data;

  const sp = await searchParams;
  const selectedGenders = (sp.gender ?? "").split(",").filter(Boolean);
  const selectedTipos = (sp.tipo ?? "").split(",").filter(Boolean);
  const sort = sp.sort ?? "relevancia";
  const pageNum = Math.max(1, Number(sp.page) || 1);

  // facetas (gênero e modelo) sobre todos os produtos do time
  const genderCounts = new Map<string, number>();
  const tipoCounts = new Map<string, number>();
  for (const p of all) {
    genderCounts.set(genderOf(p.name), (genderCounts.get(genderOf(p.name)) ?? 0) + 1);
    const tp = modeloOf(p.name);
    if (tp) tipoCounts.set(tp, (tipoCounts.get(tp) ?? 0) + 1);
  }
  const genderFacets = ["masculino", "feminina"]
    .filter((g) => genderCounts.has(g))
    .map((g) => ({ value: g, label: GENDER_LABEL[g], count: genderCounts.get(g) ?? 0 }));
  const tipoFacets = [...tipoCounts.entries()].map(([tipo, count]) => ({ tipo, count })).sort((a, b) => b.count - a.count);

  // aplica filtros
  let results = all;
  if (selectedGenders.length) results = results.filter((p) => selectedGenders.includes(genderOf(p.name)));
  if (selectedTipos.length) results = results.filter((p) => { const t = modeloOf(p.name); return !!t && selectedTipos.includes(t); });
  if (sort === "preco-asc") results = [...results].sort((a, b) => a.now - b.now);
  else if (sort === "preco-desc") results = [...results].sort((a, b) => b.now - a.now);
  else results = [...results].sort((a, b) => seasonScore(b.name) - seasonScore(a.name));

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (p: number) => {
    const q = new URLSearchParams();
    if (selectedGenders.length) q.set("gender", selectedGenders.join(","));
    if (selectedTipos.length) q.set("tipo", selectedTipos.join(","));
    if (sort !== "relevancia") q.set("sort", sort);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/time/${slug}?${qs}` : `/time/${slug}`;
  };

  const temRetro = all.some((p) => /retr[ôo]/i.test(p.name) || p.category === "retro");
  const temFem = all.some((p) => /\(feminin/i.test(p.name));

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
            <span>{results.length} {results.length === 1 ? "modelo" : "modelos"}</span>
          </h1>

          <p className="cat-intro">
            Encontre as <strong>camisas do {team} importadas</strong> com qualidade tailandesa 1:1:
            escudo bordado, tecido dry-fit e acabamento muito próximo da oficial.
            {temRetro ? " Tem versão atual e também os retrôs que marcaram época." : ""}
            {temFem ? " Disponível em modelagem masculina e feminina." : ""} Frete para todo o
            Brasil e até 3x sem juros. Não achou o modelo? <Link href="/solicitar">Solicite sua camisa</Link>.
          </p>

          {all.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag strokeWidth={1.5} />
              <h2>Em breve por aqui</h2>
              <Link className="btn btn-g" href="/">Voltar à loja</Link>
            </div>
          ) : (
            <div className="search-layout">
              <SearchFilters
                q=""
                basePath={`/time/${slug}`}
                hideCategory
                facets={[]}
                selected={[]}
                teamFacets={[]}
                selectedTeams={[]}
                genderFacets={genderFacets}
                selectedGenders={selectedGenders}
                tipoFacets={tipoFacets}
                selectedTipos={selectedTipos}
                sort={sort}
              />

              <div className="search-results">
                {results.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingBag strokeWidth={1.5} />
                    <h2>Nenhum resultado para esse filtro</h2>
                    <div className="empty-actions">
                      <Link className="btn btn-g" href="/solicitar">Solicitar uma camisa</Link>
                      <Link className="btn btn-ghost" href={`/time/${slug}`}>Limpar filtros</Link>
                    </div>
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
            </div>
          )}
        </div>
      </main>
      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
