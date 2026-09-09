"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const CAT_LABELS: Record<string, string> = {
  brasileirao: "Brasileirão",
  europa: "Europa",
  selecoes: "Seleções",
  feminina: "Feminina",
  infantil: "Conjuntos Esportivos",
  retro: "Retrô",
};

type Sel = {
  cats: string[];
  teams: string[];
  genders: string[];
  tipos: string[];
  sort: string;
};

export function SearchFilters({
  q,
  facets,
  selected,
  teamFacets,
  selectedTeams,
  genderFacets,
  selectedGenders,
  tipoFacets,
  selectedTipos,
  sort,
  basePath = "/busca",
  hideCategory = false,
}: {
  q: string;
  facets: { cat: string; count: number }[];
  selected: string[];
  teamFacets: { team: string; count: number }[];
  selectedTeams: string[];
  genderFacets: { value: string; label: string; count: number }[];
  selectedGenders: string[];
  tipoFacets: { tipo: string; count: number }[];
  selectedTipos: string[];
  sort: string;
  basePath?: string;
  hideCategory?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false); // expandir/recolher no mobile

  const activeCount =
    selected.length + selectedTeams.length + selectedGenders.length + selectedTipos.length + (sort !== "relevancia" ? 1 : 0);

  const push = (s: Sel) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (!hideCategory && s.cats.length) p.set("cat", s.cats.join(","));
    if (s.teams.length) p.set("team", s.teams.join(","));
    if (s.genders.length) p.set("gender", s.genders.join(","));
    if (s.tipos.length) p.set("tipo", s.tipos.join(","));
    if (s.sort && s.sort !== "relevancia") p.set("sort", s.sort);
    const qs = p.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const current: Sel = {
    cats: selected,
    teams: selectedTeams,
    genders: selectedGenders,
    tipos: selectedTipos,
    sort,
  };
  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const hasFilters =
    selected.length > 0 ||
    selectedTeams.length > 0 ||
    selectedGenders.length > 0 ||
    selectedTipos.length > 0 ||
    sort !== "relevancia";

  return (
    <aside className={`sf${open ? " open" : ""}`}>
      <button type="button" className="sf-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span><SlidersHorizontal size={16} /> Filtros{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <ChevronDown size={18} className="sf-toggle-chev" />
      </button>
      <div className="sf-body">
      {genderFacets.length > 0 && (
        <div className="sf-block">
          <h3>Gênero</h3>
          {genderFacets.map((f) => (
            <label key={f.value} className="sf-check">
              <input
                type="checkbox"
                checked={selectedGenders.includes(f.value)}
                onChange={() => push({ ...current, genders: toggle(selectedGenders, f.value) })}
              />
              <span>{f.label}</span>
              <em>{f.count}</em>
            </label>
          ))}
        </div>
      )}

      {!hideCategory && (
        <div className="sf-block">
          <h3>Categoria</h3>
          {facets.length === 0 ? (
            <p className="sf-empty">—</p>
          ) : (
            facets.map((f) => (
              <label key={f.cat} className="sf-check">
                <input
                  type="checkbox"
                  checked={selected.includes(f.cat)}
                  onChange={() => push({ ...current, cats: toggle(selected, f.cat) })}
                />
                <span>{CAT_LABELS[f.cat] ?? f.cat}</span>
                <em>{f.count}</em>
              </label>
            ))
          )}
        </div>
      )}

      {tipoFacets.length > 0 && (
        <div className="sf-block">
          <h3>Modelo</h3>
          {tipoFacets.map((f) => (
            <label key={f.tipo} className="sf-check">
              <input
                type="checkbox"
                checked={selectedTipos.includes(f.tipo)}
                onChange={() => push({ ...current, tipos: toggle(selectedTipos, f.tipo) })}
              />
              <span>{f.tipo}</span>
              <em>{f.count}</em>
            </label>
          ))}
        </div>
      )}

      {teamFacets.length > 0 && (
        <div className="sf-block">
          <h3>Time</h3>
          <div className="sf-scroll">
            {teamFacets.map((f) => (
              <label key={f.team} className="sf-check">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(f.team)}
                  onChange={() => push({ ...current, teams: toggle(selectedTeams, f.team) })}
                />
                <span>{f.team}</span>
                <em>{f.count}</em>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="sf-block">
        <h3>Ordenar por</h3>
        <select className="adm-select" value={sort} onChange={(e) => push({ ...current, sort: e.target.value })}>
          <option value="relevancia">Relevância</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
        </select>
      </div>

      {hasFilters && (
        <button
          className="sf-clear"
          onClick={() => push({ cats: [], teams: [], genders: [], tipos: [], sort: "relevancia" })}
        >
          Limpar filtros
        </button>
      )}
      </div>
    </aside>
  );
}
