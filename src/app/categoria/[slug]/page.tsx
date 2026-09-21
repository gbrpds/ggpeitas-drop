import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCategoryProducts, getTeamNames, metaFor } from "@/lib/catalog";
import { genderOf, modeloOf, GENDER_LABEL, seasonScore, dedupeTeamFacets } from "@/lib/facets";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// textos de SEO por coleção (descrição da metatag + parágrafo introdutório)
const CAT_SEO: Record<string, { desc: string; intro: string }> = {
  brasileirao: {
    desc: "Camisas do Brasileirão importadas com qualidade 1:1: Flamengo, Palmeiras, Corinthians, São Paulo e todos os times. Versões atuais e retrô, frete para todo o Brasil.",
    intro: "Camisas do <strong>Brasileirão importadas</strong> com qualidade tailandesa 1:1, dos gigantes aos clubes de série B. Versões atuais e retrôs que marcaram época, em modelagem masculina e feminina.",
  },
  europa: {
    desc: "Camisas de clubes europeus importadas 1:1: Real Madrid, Barcelona, Manchester United, PSG, Milan e mais. La Liga, Premier, Serie A, Bundesliga e Ligue One.",
    intro: "Camisas dos <strong>gigantes europeus importadas</strong> com qualidade 1:1: La Liga, Premier League, Serie A, Bundesliga e Ligue One. Real Madrid, Barcelona, Manchester United, PSG, Milan e muito mais.",
  },
  selecoes: {
    desc: "Camisas de seleções importadas 1:1: Brasil, Argentina, França, Alemanha e mais. Versões atuais e retrôs históricos, frete para todo o Brasil.",
    intro: "Camisas de <strong>seleções importadas</strong> com qualidade 1:1: Brasil, Argentina, França, Alemanha, Itália e outras. Modelos atuais e retrôs que fizeram história em Copas do Mundo.",
  },
  retro: {
    desc: "Camisas retrô importadas 1:1: reviva os clássicos do futebol com os uniformes que marcaram época, de clubes e seleções, com acabamento premium.",
    intro: "Camisas <strong>retrô importadas</strong> com qualidade 1:1: os uniformes clássicos que marcaram época, de clubes e seleções. Perfeitas para o colecionador e para quem tem memória afetiva com um elenco.",
  },
  mundo: {
    desc: "Camisas da MLS e da Liga Argentina importadas 1:1: Inter Miami, LA Galaxy, Boca Juniors, River Plate e mais. Frete para todo o Brasil.",
    intro: "Camisas de <strong>ligas do mundo importadas</strong> com qualidade 1:1: MLS e Liga Argentina, com Inter Miami, LA Galaxy, Boca Juniors, River Plate e outros clubes.",
  },
  feminina: {
    desc: "Camisas de futebol femininas importadas 1:1, com modelagem pensada para o corpo feminino. Clubes e seleções, frete para todo o Brasil.",
    intro: "Camisas de futebol <strong>femininas importadas</strong> com qualidade 1:1 e modelagem pensada para o corpo feminino. Dos clubes brasileiros aos gigantes europeus e seleções.",
  },
  infantil: {
    desc: "Conjuntos esportivos infantis importados 1:1: leve o uniforme do time do coração para a criançada, com qualidade e conforto.",
    intro: "<strong>Conjuntos esportivos infantis importados</strong> com qualidade 1:1 para vestir a criançada com o uniforme do time do coração.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seo = CAT_SEO[slug];
  return {
    title: metaFor(slug).title,
    description: seo?.desc,
    alternates: { canonical: `/categoria/${slug}` },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ team?: string; gender?: string; tipo?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const m = metaFor(slug);
  const all = await getCategoryProducts(slug);
  const registeredTeams = await getTeamNames();

  const selectedTeams = (sp.team ?? "").split(",").filter(Boolean);
  const selectedGenders = (sp.gender ?? "").split(",").filter(Boolean);
  const selectedTipos = (sp.tipo ?? "").split(",").filter(Boolean);
  const sort = sp.sort ?? "relevancia";

  // facetas (sobre todos os produtos da categoria)
  const teamCounts = new Map<string, number>();
  const genderCounts = new Map<string, number>();
  const tipoCounts = new Map<string, number>();
  for (const p of all) {
    if (p.team) teamCounts.set(p.team, (teamCounts.get(p.team) ?? 0) + 1);
    const g = genderOf(p.name);
    genderCounts.set(g, (genderCounts.get(g) ?? 0) + 1);
    const tp = modeloOf(p.name);
    if (tp) tipoCounts.set(tp, (tipoCounts.get(tp) ?? 0) + 1);
  }
  // só mostra times que têm produtos NESTA categoria (+ os cadastrados que também tenham)
  const teamNames = new Set<string>([...teamCounts.keys()]);
  for (const t of registeredTeams) if (teamCounts.has(t)) teamNames.add(t);
  const teamFacets = dedupeTeamFacets(
    [...teamNames].map((team) => ({ team, count: teamCounts.get(team) ?? 0 })),
    registeredTeams,
  );
  const genderFacets = ["masculino", "feminina"]
    .filter((g) => genderCounts.has(g))
    .map((g) => ({ value: g, label: GENDER_LABEL[g], count: genderCounts.get(g) ?? 0 }));
  const tipoFacets = [...tipoCounts.entries()]
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);

  // aplica os filtros selecionados
  let results = all;
  if (selectedTeams.length) {
    const wanted = new Set(selectedTeams.map(norm));
    results = results.filter((p) => p.team && wanted.has(norm(p.team)));
  }
  if (selectedGenders.length) results = results.filter((p) => selectedGenders.includes(genderOf(p.name)));
  if (selectedTipos.length) results = results.filter((p) => { const t = modeloOf(p.name); return !!t && selectedTipos.includes(t); });
  if (sort === "preco-asc") results = [...results].sort((a, b) => a.now - b.now);
  else if (sort === "preco-desc") results = [...results].sort((a, b) => b.now - a.now);
  else results = [...results].sort((a, b) => seasonScore(b.name) - seasonScore(a.name)); // padrão: temporada mais recente

  // paginação
  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (selectedTeams.length) params.set("team", selectedTeams.join(","));
    if (selectedGenders.length) params.set("gender", selectedGenders.join(","));
    if (selectedTipos.length) params.set("tipo", selectedTipos.join(","));
    if (sort !== "relevancia") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/categoria/${slug}?${qs}` : `/categoria/${slug}`;
  };

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap search-page">
          <h1 className="search-title">
            {m.title}
            <span>{results.length} {results.length === 1 ? "item" : "itens"}</span>
          </h1>

          {CAT_SEO[slug]?.intro ? (
            <p className="cat-intro" dangerouslySetInnerHTML={{ __html: CAT_SEO[slug].intro }} />
          ) : null}

          {all.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag strokeWidth={1.5} />
              <h2>Em breve por aqui</h2>
              <p>Ainda não há produtos nesta categoria.</p>
              <Link className="btn btn-g" href="/">Voltar à loja</Link>
            </div>
          ) : (
            <div className="search-layout">
              <SearchFilters
                q=""
                basePath={`/categoria/${slug}`}
                hideCategory
                facets={[]}
                selected={[]}
                teamFacets={teamFacets}
                selectedTeams={selectedTeams}
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
                      <Link className="btn btn-ghost" href={`/categoria/${slug}`}>Limpar filtros</Link>
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
