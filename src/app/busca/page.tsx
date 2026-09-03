import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getAllActive } from "@/lib/catalog";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Busca — GG Peitas" };

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; team?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const selected = (sp.cat ?? "").split(",").filter(Boolean);
  const selectedTeams = (sp.team ?? "").split(",").filter(Boolean);
  const sort = sp.sort ?? "relevancia";

  const all = await getAllActive();
  const nq = norm(q);
  const teamQuery = selectedTeams.length ? selectedTeams[0] : "";
  // termo efetivo: busca digitada OU time vindo do menu
  const matched = (q || teamQuery)
    ? all.filter((p) => {
        const hay = `${p.name} ${p.team ?? ""} ${p.category}`;
        const okQ = q ? norm(hay).includes(nq) : true;
        return okQ;
      })
    : all;

  // facetas de categoria e de time (com contagem) sobre o conjunto encontrado
  const counts = new Map<string, number>();
  const teamCounts = new Map<string, number>();
  for (const p of matched) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    if (p.team) teamCounts.set(p.team, (teamCounts.get(p.team) ?? 0) + 1);
  }
  const facets = [...counts.entries()].map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);
  const teamFacets = [...teamCounts.entries()].map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);

  let results = matched;
  if (selected.length) results = results.filter((p) => selected.includes(p.category));
  if (selectedTeams.length) {
    const wanted = new Set(selectedTeams.map(norm));
    results = results.filter((p) => p.team && wanted.has(norm(p.team)));
  }
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
      <WhatsAppFloat />
      <MobileDrawer />
    </>
  );
}
