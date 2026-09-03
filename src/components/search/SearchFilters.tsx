"use client";

import { useRouter } from "next/navigation";

const CAT_LABELS: Record<string, string> = {
  brasileirao: "Brasileirão",
  europa: "Europa",
  selecoes: "Seleções",
  futebol: "Futebol",
  feminina: "Feminina",
  infantil: "Conjunto Infantil",
  player: "Player (Authentic)",
  retro: "Retrô",
};

export function SearchFilters({
  q,
  facets,
  selected,
  teamFacets,
  selectedTeams,
  sort,
}: {
  q: string;
  facets: { cat: string; count: number }[];
  selected: string[];
  teamFacets: { team: string; count: number }[];
  selectedTeams: string[];
  sort: string;
}) {
  const router = useRouter();

  const push = (cats: string[], teams: string[], sortV: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cats.length) p.set("cat", cats.join(","));
    if (teams.length) p.set("team", teams.join(","));
    if (sortV && sortV !== "relevancia") p.set("sort", sortV);
    router.push(`/busca?${p.toString()}`);
  };

  const toggleCat = (c: string) => {
    const s = selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c];
    push(s, selectedTeams, sort);
  };
  const toggleTeam = (t: string) => {
    const s = selectedTeams.includes(t) ? selectedTeams.filter((x) => x !== t) : [...selectedTeams, t];
    push(selected, s, sort);
  };

  const hasFilters = selected.length > 0 || selectedTeams.length > 0 || sort !== "relevancia";

  return (
    <aside className="sf">
      <div className="sf-block">
        <h3>Categoria</h3>
        {facets.length === 0 ? (
          <p className="sf-empty">—</p>
        ) : (
          facets.map((f) => (
            <label key={f.cat} className="sf-check">
              <input type="checkbox" checked={selected.includes(f.cat)} onChange={() => toggleCat(f.cat)} />
              <span>{CAT_LABELS[f.cat] ?? f.cat}</span>
              <em>{f.count}</em>
            </label>
          ))
        )}
      </div>

      {teamFacets.length > 0 && (
        <div className="sf-block">
          <h3>Time</h3>
          <div className="sf-scroll">
            {teamFacets.map((f) => (
              <label key={f.team} className="sf-check">
                <input type="checkbox" checked={selectedTeams.includes(f.team)} onChange={() => toggleTeam(f.team)} />
                <span>{f.team}</span>
                <em>{f.count}</em>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="sf-block">
        <h3>Ordenar por</h3>
        <select className="adm-select" value={sort} onChange={(e) => push(selected, selectedTeams, e.target.value)}>
          <option value="relevancia">Relevância</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
        </select>
      </div>

      {hasFilters && (
        <button className="sf-clear" onClick={() => push([], [], "relevancia")}>
          Limpar filtros
        </button>
      )}
    </aside>
  );
}
