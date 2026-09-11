import Link from "next/link";
import { Tag } from "lucide-react";
import { getPromoProducts, getTeamNames } from "@/lib/catalog";
import { genderOf, modeloOf, GENDER_LABEL } from "@/lib/facets";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Leve 3, Pague 2 — GG Peitas",
  description: "Monte o kit da família: a cada 3 camisas participantes, a mais barata sai grátis.",
};

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default async function PromocaoPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; gender?: string; tipo?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const all = await getPromoProducts();
  const registeredTeams = await getTeamNames();

  const selectedTeams = (sp.team ?? "").split(",").filter(Boolean);
  const selectedGenders = (sp.gender ?? "").split(",").filter(Boolean);
  const selectedTipos = (sp.tipo ?? "").split(",").filter(Boolean);
  const sort = sp.sort ?? "relevancia";

  // facetas
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
  const teamNames = new Set<string>([...teamCounts.keys()]);
  for (const t of registeredTeams) if (teamCounts.has(t)) teamNames.add(t);
  const teamFacets = [...teamNames]
    .map((team) => ({ team, count: teamCounts.get(team) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team, "pt-BR"));
  const genderFacets = ["masculino", "feminina"]
    .filter((g) => genderCounts.has(g))
    .map((g) => ({ value: g, label: GENDER_LABEL[g], count: genderCounts.get(g) ?? 0 }));
  const tipoFacets = [...tipoCounts.entries()].map(([tipo, count]) => ({ tipo, count })).sort((a, b) => b.count - a.count);

  // filtros
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
    return qs ? `/promocao?${qs}` : "/promocao";
  };

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap search-page">
          <h1 className="search-title">
            Leve 3, Pague 2
            <span>{results.length} {results.length === 1 ? "item" : "itens"}</span>
          </h1>
          <p className="auth-lead" style={{ marginTop: -8 }}>
            A cada <b>3 camisas participantes</b> no carrinho, a <b>mais barata sai grátis</b> — o desconto é
            aplicado automaticamente.
          </p>

          {all.length === 0 ? (
            <div className="cart-empty">
              <Tag strokeWidth={1.5} />
              <h2>Nenhuma camisa na promoção agora</h2>
              <p>Volte em breve — estamos preparando os kits!</p>
              <Link className="btn btn-g" href="/">Ver a loja</Link>
            </div>
          ) : (
            <div className="search-layout">
              <SearchFilters
                q=""
                basePath="/promocao"
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
                    <Tag strokeWidth={1.5} />
                    <h2>Nenhum resultado para esse filtro</h2>
                    <Link className="btn btn-g" href="/promocao">Limpar filtros</Link>
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
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
