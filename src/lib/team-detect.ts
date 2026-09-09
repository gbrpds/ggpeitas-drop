import { navItems } from "@/data/nav";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Mapa normalizado nome-do-time → { nome canônico, categoria } a partir do menu. */
function teamMap(): Record<string, { name: string; category: string }> {
  const map: Record<string, { name: string; category: string }> = {};
  const fut = navItems.find((i) => i.label === "Futebol");
  for (const g of fut?.groups ?? []) {
    const cat = g.label === "Europa" ? "europa" : "brasileirao";
    for (const l of g.links) map[norm(l.name)] = { name: l.name, category: cat };
  }
  const sel = navItems.find((i) => i.label === "Seleções");
  for (const g of sel?.groups ?? []) {
    for (const l of g.links) map[norm(l.name)] = { name: l.name, category: "selecoes" };
  }
  return map;
}

/** Classifica um nome de time em { nome canônico, categoria } (ou null se desconhecido). */
export function classifyTeam(name: string): { name: string; category: string } | null {
  return teamMap()[norm(name)] ?? null;
}

export type TitleDetect = { team: string; category: string; feminina: boolean; mangaLonga: boolean };

/**
 * Deduz time / categoria / feminina a partir do título padrão:
 *  - "Camisa Cruzeiro 26/27 - Home (Masculino)"
 *  - "Camisa Cruzeiro Retrô 1993/94 - Away (Masculino)"  → categoria Retrô
 *  - "Camisa Cruzeiro 26/27 (Manga Longa) - Home"
 *  - "... (Feminino)" / "... Feminina"                   → marca Feminina
 */
export function detectFromTitle(title: string): TitleDetect {
  const t = title.trim();
  const feminina = /femin/i.test(t);
  const isRetro = /retr[ôo]/i.test(t);
  const mangaLonga = /manga\s*longa/i.test(t);

  // tira o prefixo "Camisa " e o termo "Retrô", depois isola o time
  // (até o ano, um parêntese ou o traço). Sem depender de \b em acento.
  const rest = t
    .replace(/^\s*camisa\s+/i, "")
    .replace(/\s*retr[ôo]\s*/i, " ")
    .trim();
  const m = rest.match(/^(.*?)(?:\s+\d{2,4}\/\d{2,4}|\s+\d{4}|\s+\(|\s+-|$)/);
  const teamRaw = (m ? m[1] : rest).trim();

  const hit = teamMap()[norm(teamRaw)];
  const team = hit?.name ?? teamRaw;
  // Retrô é uma coleção própria e tem prioridade; senão, a coleção do time
  const category = isRetro ? "retro" : hit?.category ?? "brasileirao";

  return { team, category, feminina, mangaLonga };
}
