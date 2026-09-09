import { classifyTeam } from "@/lib/team-detect";

/** Headers que o Yupoo exige para servir páginas/imagens (checa referer). */
export function yupooHeaders(referer: string) {
  return { "User-Agent": "Mozilla/5.0", Referer: referer };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Produtos que NÃO devem ser importados:
 *  - kits infantis / kit / baby ("Kids", "Kit", "Baby Jersey")
 *  - versão jogador ("Player"/"Players") — vendemos só a Torcedor (Fan)
 *  - shorts/bermudas, jaquetas/corta-vento (Jacket/Windbreaker)
 */
export function shouldSkipTitle(title: string): boolean {
  return (
    /\bkids?\b/i.test(title) ||
    /\bkit\b/i.test(title) ||
    /\bbaby\b/i.test(title) ||
    /\bplayers?\b/i.test(title) ||
    /\bshorts?\b/i.test(title) ||
    /\bjacket\b/i.test(title) ||
    /\bwindbreaker\b/i.test(title)
  );
}

export type YupooAlbum = { id: string; title: string };

/** Extrai os álbuns (id + título) da página de uma categoria. */
export function parseCategory(html: string): YupooAlbum[] {
  const out: YupooAlbum[] = [];
  const seen = new Set<string>();
  const re = /<a\b([^>]*?href="\/albums\/(\d+)[^"]*"[^>]*?)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const id = m[2];
    if (seen.has(id)) continue;
    seen.add(id);
    const tm = attrs.match(/title="([^"]*)"/i);
    out.push({ id, title: tm ? decodeEntities(tm[1]) : "" });
  }
  return out;
}

/** Caminhos-base das fotos de um álbum (ex.: photo.yupoo.com/conta/hash), na ordem. */
export function parseAlbumPhotos(html: string): string[] {
  const re = /\/\/?(photo\.yupoo\.com\/[a-z0-9_]+\/[a-z0-9]+)\/(?:small|medium|large|big|raw)\.(?:jpe?g|png)/gi;
  const seen: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (!seen.includes(m[1])) seen.push(m[1]);
  }
  return seen;
}

/** URL da versão grande de uma foto a partir do caminho-base. */
export function photoUrl(base: string): string {
  return `https://${base}/large.jpg`;
}

export type ImportedProduct = {
  name: string;
  team: string | null;
  category: string;
  feminina: boolean;
  infantil: boolean;
  priceCents: number;
  compareCents: number;
};

const reais = (v: number) => Math.round(v * 100);

/** Expande o ano de camisas retrô: "93/94" → "1993/94"; "05/06" → "2005/06". */
function expandRetroYear(year: string): string {
  const m = year.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return year; // já é 4 dígitos ou formato diferente
  const century = Number(m[1]) >= 30 ? "19" : "20";
  return `${century}${m[1]}/${m[2]}`;
}

/**
 * Converte o título (inglês) do Yupoo no produto em PT, INTERPRETANDO o modelo:
 *  - "Cruzeiro 26/27 GK-Purple Jersey S-4XL"     → "Camisa Cruzeiro 26/27 - Goleiro (Masculino)"
 *  - "Cruzeiro 26/27 Brazil Edition Jersey"      → "Camisa Cruzeiro 26/27 - Copa do Mundo (Masculino)"
 *  - "Cruzeiro 93/94 Away Retro Jersey S-XXL"    → "Camisa Cruzeiro Retrô 1993/94 - Away (Masculino)"
 *  - "... Home/Away/Third ..."                   → tipo Home/Away/Third
 *  - "... Women/Feminino ..."                    → (Feminino) + flag
 *  - "... Kids ..."                              → flag Conjuntos Esportivos
 *  - "... Long Sleeve ..."                       → (Manga Longa)
 * O tamanho no fim (S-4XL, Size 16-28) é ignorado.
 */
export function yupooTitleToProduct(rawTitle: string): ImportedProduct {
  const clean = rawTitle
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "") // bandeiras/emoji
    .replace(/\s{2,}/g, " ")
    .trim();

  const cropTop = /\bcrop\s*top\b/i.test(clean);
  const feminina = cropTop || /\b(women|woman|female|feminin[oa]?|lady|girls?)\b/i.test(clean);
  const infantil = /\b(kids?|infantil|youth|crian[çc]a)\b/i.test(clean);
  const mangaLonga = /\b(long\s*sleeve|manga\s*longa)\b/i.test(clean);
  const isRetro = /\bretro\b|\bretr[ôo]\b/i.test(clean);

  // ano: "26/27", "93/94", "1993/94" ou "1994"
  const yearMatch = clean.match(/\b\d{2,4}\/\d{2,4}\b|\b(?:19|20)\d{2}\b/);
  const yearRaw = yearMatch ? yearMatch[0] : "";
  const year = isRetro ? expandRetroYear(yearRaw) : yearRaw;

  // time = tudo antes do ano (ou antes de "Jersey"/tipo, se não houver ano)
  let teamRaw = yearMatch
    ? clean.slice(0, yearMatch.index).trim()
    : clean.split(/\b(jersey|home|away|third|goalkeeper|gk|kit|retro|edition)\b/i)[0].trim();
  teamRaw = teamRaw.replace(/\bretro\b/i, "").replace(/\s{2,}/g, " ").trim();

  const hit = classifyTeam(teamRaw);
  const team = hit?.name ?? (teamRaw || null);
  const category = isRetro ? "retro" : hit?.category ?? "brasileirao";

  // TIPO — na ordem de prioridade dos padrões do fornecedor
  let tipo = "";
  if (cropTop) tipo = "Top Cropped"; // cropped feminino (substitui Home/Away)
  else if (/\bgoalkeeper\b|\bgk\b/i.test(clean)) tipo = "Goleiro"; // ignora cor (GK-Purple etc.)
  else if (/\bbrazil\s*edition\b|\bworld\s*cup\b|\bcopa do mundo\b/i.test(clean)) tipo = "Copa do Mundo";
  else if (/\bpre-?match\b/i.test(clean)) tipo = "Pré-Jogo";
  else if (/\btraining\b|\btreino\b/i.test(clean)) tipo = "Treino";
  else if (/\bthird\b|\b3rd\b/i.test(clean)) tipo = /\bhome\b/i.test(clean) ? "Third Home" : "Third Away";
  else if (/\baway\b/i.test(clean)) tipo = "Away";
  else if (/\bhome\b/i.test(clean)) tipo = "Home";
  else if (/\bspecial\b/i.test(clean)) tipo = "Edição Especial";

  const teamLabel = team ?? "Camisa";
  // Crop top e infantil não levam sufixo de gênero
  const gender = infantil || cropTop ? "" : feminina ? " (Feminino)" : " (Masculino)";
  let name: string;
  if (isRetro) {
    name = `Camisa ${teamLabel} Retrô${year ? ` ${year}` : ""}`;
    if (tipo) name += ` - ${tipo}`;
  } else {
    name = `Camisa ${teamLabel}${year ? ` ${year}` : ""}`;
    if (mangaLonga) name += " (Manga Longa)";
    if (tipo) name += ` - ${tipo}`;
  }
  name = (name + gender).replace(/\s{2,}/g, " ").trim();

  const special = category === "retro" || mangaLonga;
  const priceCents = special ? reais(229.9) : reais(189.9);
  const compareCents = special ? reais(299.9) : reais(269.9);

  return { name, team, category, feminina, infantil, priceCents, compareCents };
}
