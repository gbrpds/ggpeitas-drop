import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getAllActive, getTeamNames } from "@/lib/catalog";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { genderOf, modeloOf as tipoOf, GENDER_LABEL } from "@/lib/facets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Busca — GG Peitas" };

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; team?: string; gender?: string; tipo?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const selected = (sp.cat ?? "").split(",").filter(Boolean);
  const selectedTeams = (sp.team ?? "").split(",").filter(Boolean);
  const selectedGenders = (sp.gender ?? "").split(",").filter(Boolean);
  const selectedTipos = (sp.tipo ?? "").split(",").filter(Boolean);
  const sort = sp.sort ?? "relevancia";

  const all = await getAllActive();
  const registeredTeams = await getTeamNames();
  // busca por PALAVRAS: cada palavra digitada precisa aparecer (em qualquer ordem)
  // no nome/time/categoria. Ex.: "flamengo copa do mundo" acha
  // "Camisa Flamengo 26/27 - Copa do Mundo Zico".
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const matched = tokens.length
    ? all.filter((p) => {
        const hay = norm(`${p.name} ${p.team ?? ""} ${p.category}`);
        return tokens.every((t) => hay.includes(t));
      })
    : all;

  // facetas de categoria, time, gênero e tipo (com contagem) sobre o encontrado
  const counts = new Map<string, number>();
  const teamCounts = new Map<string, number>();
  const genderCounts = new Map<string, number>();
  const tipoCounts = new Map<string, number>();
  for (const p of matched) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    if (p.team) teamCounts.set(p.team, (teamCounts.get(p.team) ?? 0) + 1);
    const g = genderOf(p.name);
    genderCounts.set(g, (genderCounts.get(g) ?? 0) + 1);
    const tp = tipoOf(p.name);
    if (tp) tipoCounts.set(tp, (tipoCounts.get(tp) ?? 0) + 1);
  }
  const facets = [...counts.entries()].map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);
  const genderFacets = ["masculino", "feminina"]
    .filter((g) => genderCounts.has(g))
    .map((g) => ({ value: g, label: GENDER_LABEL[g], count: genderCounts.get(g) ?? 0 }));
  const tipoFacets = [...tipoCounts.entries()]
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);
  // Todos os times cadastrados ficam selecionáveis (mesmo sem produtos ainda),
  // somados aos times que aparecem nos resultados.
  const teamNames = new Set<string>([...registeredTeams, ...teamCounts.keys()]);
  const teamFacets = [...teamNames]
    .map((team) => ({ team, count: teamCounts.get(team) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team, "pt-BR"));

  let results = matched;
  if (selected.length) results = results.filter((p) => selected.includes(p.category));
  if (selectedTeams.length) {
    const wanted = new Set(selectedTeams.map(norm));
    results = results.filter((p) => p.team && wanted.has(norm(p.team)));
  }
  if (selectedGenders.length) results = results.filter((p) => selectedGenders.includes(genderOf(p.name)));
  if (selectedTipos.length) results = results.filter((p) => { const t = tipoOf(p.name); return !!t && selectedTipos.includes(t); });
  if (sort === "preco-asc") results = [...results].sort((a, b) => a.now - b.now);
  else if (sort === "preco-desc") results = [...results].sort((a, b) => b.now - a.now);

  const heading = q ? `Resultados para “${q}”` : selectedTeams.length ? selectedTeams[0] : "Todos os produtos";

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap search-page">
          <h1 className="search-title">
            {heading}
            <span>{results.length} {results.length === 1 ? "item" : "itens"}</span>
          </h1>

          <div className="search-layout">
            <SearchFilters
              q={q}
              facets={facets}
              selected={selected}
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
                  <SearchIcon strokeWidth={1.5} />
                  <h2>Nenhum resultado encontrado</h2>
                  <p>Tente outro termo ou remova os filtros.</p>
                  <Link className="btn btn-g" href="/">Voltar à loja</Link>
                </div>
              ) : (
                <div className="cat-grid">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
