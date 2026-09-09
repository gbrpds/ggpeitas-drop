import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCategoryProducts, getTeamNames, metaFor } from "@/lib/catalog";
import { genderOf, modeloOf, GENDER_LABEL } from "@/lib/facets";
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${metaFor(slug).title} — GG Peitas` };
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
  const teamFacets = [...teamNames]
    .map((team) => ({ team, count: teamCounts.get(team) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team, "pt-BR"));
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
                    <Link className="btn btn-g" href={`/categoria/${slug}`}>Limpar filtros</Link>
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
