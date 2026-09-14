/** Helpers de faceta compartilhados entre a busca e as páginas de categoria. */

export const GENDER_LABEL: Record<string, string> = { masculino: "Masculino", feminina: "Feminina" };

/** Gênero deduzido do nome padronizado do produto. */
export function genderOf(name: string): "feminina" | "masculino" {
  return /\(feminino\)|top cropped/i.test(name) ? "feminina" : "masculino";
}

/**
 * Nota de temporada para ordenar (mais recente primeiro).
 * "26/27" → 2026, "25/26" → 2025, "1993/94" → 1993, "1994" → 1994, sem ano → 0.
 */
export function seasonScore(name: string): number {
  const m = name.match(/(\d{2,4})\/\d{2,4}/);
  if (m) return m[1].length === 4 ? Number(m[1]) : 2000 + Number(m[1]);
  const y = name.match(/\b(?:19|20)\d{2}\b/);
  return y ? Number(y[0]) : 0;
}

/** Chave normalizada de time (sem acento/caixa/pontuação) para dedup. */
export const teamKey = (s?: string | null) =>
  (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Funde facetas de time por chave normalizada (defesa contra variações de
 * caixa/acento). Mantém como rótulo o nome canônico cadastrado, se houver;
 * senão, o primeiro nome visto. Soma as contagens e reordena.
 */
export function dedupeTeamFacets(
  facets: { team: string; count: number }[],
  registered: string[] = [],
): { team: string; count: number }[] {
  const canon = new Map<string, string>();
  for (const t of registered) canon.set(teamKey(t), t);
  const merged = new Map<string, { team: string; count: number }>();
  for (const f of facets) {
    const k = teamKey(f.team);
    const label = canon.get(k) ?? f.team;
    const cur = merged.get(k);
    if (cur) cur.count += f.count;
    else merged.set(k, { team: label, count: f.count });
  }
  return [...merged.values()].sort(
    (a, b) => b.count - a.count || a.team.localeCompare(b.team, "pt-BR"),
  );
}

/** Modelo/tipo (rótulo) deduzido do nome, para o filtro. */
export function modeloOf(name: string): string | null {
  if (/manga longa/i.test(name)) return "Manga Longa";
  if (/goleiro/i.test(name)) return "Goleiro";
  if (/copa do mundo/i.test(name)) return "Copa do Mundo";
  if (/top cropped/i.test(name)) return "Top Cropped";
  if (/third/i.test(name)) return "Third";
  if (/away/i.test(name)) return "Away";
  if (/home/i.test(name)) return "Home";
  return null;
}
