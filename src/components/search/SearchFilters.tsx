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
  sort,
}: {
  q: string;
  facets: { cat: string; count: number }[];
  selected: string[];
  sort: string;
}) {
  const router = useRouter();

  const push = (cats: string[], sortV: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cats.length) p.set("cat", cats.join(","));
    if (sortV && sortV !== "relevancia") p.set("sort", sortV);
    router.push(`/busca?${p.toString()}`);
  };

  const toggleCat = (c: string) => {
    const s = selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c];
    push(s, sort);
  };

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

      <div className="sf-block">
        <h3>Ordenar por</h3>
        <select className="adm-select" value={sort} onChange={(e) => push(selected, e.target.value)}>
          <option value="relevancia">Relevância</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
        </select>
      </div>

      {(selected.length > 0 || sort !== "relevancia") && (
        <button className="sf-clear" onClick={() => push([], "relevancia")}>
          Limpar filtros
        </button>
      )}
    </aside>
  );
}
