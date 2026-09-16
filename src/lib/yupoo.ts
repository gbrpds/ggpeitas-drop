import { classifyTeam } from "@/lib/team-detect";
import { resolveEuroTeam } from "@/lib/euro-teams";

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
  // camiseta casual só é importada quando é uma edição reconhecida
  const isEdition = /\bterrace icons?\b|\boriginals?\b|\bculture\b|\bedition\b/i.test(title);
  return (
    /\bkids?\b/i.test(title) ||
    /\bkit\b/i.test(title) ||
    /\bbaby\b/i.test(title) ||
    /\bplayers?\b/i.test(title) ||
    /\bshorts?\b/i.test(title) ||
    /\bjacket\b/i.test(title) ||
    /\bwindbreaker\b/i.test(title) ||
    /\bwindrunner\b/i.test(title) ||
    /\banthem\b/i.test(title) ||
    /\bcoat\b/i.test(title) ||
    /\bvest\b/i.test(title) ||
    /\bregata\b/i.test(title) ||
    /\bsweat(er|shirt)?\b/i.test(title) ||
    /\bhoodie\b/i.test(title) ||
    /\bpuffer\b/i.test(title) ||
    /\btracksuit\b/i.test(title) ||
    /\bpants?\b/i.test(title) ||
    /\bleggings?\b/i.test(title) ||
    /\bsocks?\b/i.test(title) ||
    /\bscarf\b/i.test(title) ||
    /\bbeanie\b/i.test(title) ||
    /\bbaseball\b/i.test(title) ||
    (!isEdition && (/\bt-?shirts?\b/i.test(title) || /\btee\b/i.test(title))) ||
    /\btraining\b/i.test(title) ||
    /\btreino\b/i.test(title) ||
    /\bsuit\b/i.test(title)
  );
}

const normLower = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s{2,}/g, " ").trim();

/** Seleções: nome do país (EN/PT normalizado) → nome canônico em PT. */
const COUNTRY: Record<string, string> = {
  brazil: "Brasil", brasil: "Brasil", argentina: "Argentina", uruguay: "Uruguai",
  uruguai: "Uruguai", portugal: "Portugal", spain: "Espanha", espanha: "Espanha",
  france: "França", franca: "França", germany: "Alemanha", alemanha: "Alemanha",
  england: "Inglaterra", inglaterra: "Inglaterra", italy: "Itália", italia: "Itália",
  netherlands: "Holanda", holanda: "Holanda", mexico: "México", japan: "Japão",
  colombia: "Colômbia", chile: "Chile", croatia: "Croácia", belgium: "Bélgica",
  morocco: "Marrocos", "united states": "Estados Unidos", usa: "Estados Unidos",
};
/** Nomes canônicos (PT) de todas as seleções reconhecidas. */
export const COUNTRY_NAMES = [...new Set(Object.values(COUNTRY))];
const COUNTRY_KEYS = Object.keys(COUNTRY)
  .map((k) => ({ k, norm: k.replace(/[^a-z0-9]/g, "") }))
  .filter((x) => x.norm.length >= 4) // evita falso-positivo com chaves curtas (ex.: "usa")
  .sort((a, b) => b.norm.length - a.norm.length);

/** Modificadores que aparecem antes do nome do time e devem ser ignorados. */
const LEAD_MODIFIERS =
  /^(?:long|sleeve|longsleeve|long-sleeved|longsleeved|retro|shirt|vintage|classic|new|women|womens|woman|men|mens|man|male|female|kids?|youth|home|away|third|goalkeeper|gk|special|edition|version|main|size)\s+/;

/**
 * Detecta o país (seleção) NO INÍCIO do trecho do time, após remover
 * modificadores ("long sleeve Spain", "retro shirt Spain", "Women Brazil").
 * Exige que COMECE com o país — assim "Flamengo Brazil Edition" (edição de
 * clube) NÃO é confundido com a seleção do Brasil.
 */
export function resolveCountry(teamRaw: string): string | null {
  let s = normLower(teamRaw);
  for (let i = 0; i < 6 && LEAD_MODIFIERS.test(s); i++) s = s.replace(LEAD_MODIFIERS, "");
  const k = s.replace(/[^a-z0-9]/g, "");
  if (!k) return null;
  for (const { k: key, norm } of COUNTRY_KEYS) if (k.startsWith(norm)) return COUNTRY[key];
  return null;
}

/** Times da Série A (do menu do fornecedor), com apelidos, para filtrar só o Brasileirão. */
export const BRASILEIRAO_TEAMS = [
  "flamengo", "palmeiras", "sao paulo", "corinthians", "santos", "gremio",
  "botafogo", "atletico mineiro", "atletico-mg", "atletico mg", "fluminense",
  "athletico paranaense", "atletico paranaense", "athletico-pr", "atletico-pr",
  "internacional", "inter de porto alegre", "fortaleza", "cruzeiro",
  "vasco da gama", "vasco", "bahia", "sport recife", "sport", "paysandu",
  "vitoria", "remo", "santa cruz", "confianca", "nautico", "recife",
  "ceara sporting", "ceara", "chapecoense", "coritiba",
  "red bull bragantino", "bragantino", "atletico juventus", "cuiaba",
];

/** O título pertence a um time do Brasileirão? (começa com o nome do time). */
export function matchesBrasileirao(title: string): boolean {
  const t = normLower(title.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ""));
  return BRASILEIRAO_TEAMS.some((team) => t === team || t.startsWith(team + " "));
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
  promo3x2: boolean;
};

const reais = (v: number) => Math.round(v * 100);

/** Cores (forma feminina, para concordar com "Camisa"/"Edição"). */
const COLORS: Record<string, string> = {
  white: "Branca", black: "Preta", blue: "Azul", red: "Vermelha",
  yellow: "Amarela", green: "Verde", purple: "Roxa", pink: "Rosa",
  orange: "Laranja", gray: "Cinza", grey: "Cinza", gold: "Dourada",
  silver: "Prata", brown: "Marrom", navy: "Azul-Marinho", beige: "Bege",
};
const colorRe = new RegExp(`\\b(${Object.keys(COLORS).join("|")})\\b`, "i");

/** Palavras conhecidas para nomear edições especiais (o resto mantém o original). */
const EDITION_WORDS: Record<string, string> = {
  special: "Especial", anniversary: "Aniversário", commemorative: "Comemorativa",
  champions: "Campeões", champion: "Campeão", legend: "Lenda", legends: "Lendas",
  training: "Treino", concept: "Conceito", classic: "Clássica", heritage: "Herança",
  ...COLORS,
};

/** Traduz o nome de uma edição: cor/palavra conhecida ou mantém capitalizado. */
function editionLabel(word: string): string {
  const k = word.toLowerCase();
  if (EDITION_WORDS[k]) return EDITION_WORDS[k];
  return word.charAt(0).toUpperCase() + word.slice(1);
}

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
export function yupooTitleToProduct(rawTitle: string, teamOverride?: string): ImportedProduct {
  const clean = rawTitle
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "") // bandeiras/emoji
    // apelidos do fornecedor p/ Manchester United ("M-U", "M United", "M. United",
    // "M-U1998"...) e Liverpool ("LFC")
    .replace(/\bM[.\s-]*United\b/gi, "Manchester United")
    .replace(/\bM[.\s-]*U(?![a-z])/gi, " Manchester United ")
    .replace(/\bLFC\b/gi, "Liverpool")
    .replace(/\bAC\b/g, "AC Milan") // "AC" (maiúsculo) = AC Milan (fornecedor abrevia)
    // temporada sem barra: "2627" → "26/27", "2526" → "25/26" (dois anos seguidos)
    .replace(/\b(\d{2})(\d{2})\b/g, (m, a, b) => (Number(b) === Number(a) + 1 ? `${a}/${b}` : m))
    // temporada com traço/espaço: "23-24" / "22 / 23" → "23/24" / "22/23"
    .replace(/\b(\d{2})\s*[-/]\s*(\d{2})\b/g, (m, a, b) => (Number(b) === Number(a) + 1 ? `${a}/${b}` : m))
    .replace(/\s{2,}/g, " ")
    .trim();

  const cropTop = /\bcrop\s*top\b/i.test(clean);
  const feminina = cropTop || /\b(women|woman|female|feminin[oa]?|lady|girls?)\b/i.test(clean);
  const infantil = /\b(kids?|infantil|youth|crian[çc]a)\b/i.test(clean);
  const mangaLonga = /\b(long\s*sleeve|manga\s*longa)\b/i.test(clean);
  // "retro" em linhas casuais (Terrace Icons/Originals) é estilo, não camisa retrô
  const casualEdition = /\bterrace icons?\b|\boriginals?\b/i.test(clean);
  const isRetro = (/\bretro\b|\bretr[ôo]\b/i.test(clean)) && !casualEdition;

  // ano: "26/27", "93/94", "1993/94" ou "1994"
  const yearMatch = clean.match(/\b\d{2,4}\/\d{2,4}\b|\b(?:19|20)\d{2}\b/);
  const yearRaw = yearMatch ? yearMatch[0] : "";
  const year = isRetro ? expandRetroYear(yearRaw) : yearRaw;

  // time = tudo antes do ano (ou antes de "Jersey"/tipo, se não houver ano)
  let teamRaw = yearMatch
    ? clean.slice(0, yearMatch.index).trim()
    : clean.split(/\b(jersey|home|away|third|goalkeeper|gk|kit|retro|edition)\b/i)[0].trim();
  teamRaw = teamRaw.replace(/\bretro\b/i, "").replace(/\s{2,}/g, " ").trim();
  // título com o ano na frente ("23/24 Barcelona ...") → pega o time depois do ano
  if (!teamRaw && yearMatch) {
    const after = clean.slice(yearMatch.index! + yearMatch[0].length);
    teamRaw = after
      .split(/\b(jersey|home|away|third|goalkeeper|gk|long|special|edition|version|women|main|size)\b/i)[0]
      .replace(/\bretro\b/i, "")
      .replace(/[^\p{L}\s]/gu, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  // reconhece times europeus (La Liga etc.) em qualquer posição do título
  // (só quando o admin não forçou um time)
  const euro = teamOverride?.trim() ? null : resolveEuroTeam(clean);
  // seleção detectada no trecho do time (ex.: "long sleeve Spain" → Espanha)
  const country = teamOverride?.trim() ? null : resolveCountry(teamRaw);
  // time: admin > país (seleção) > europeu reconhecido > derivado do título
  const teamName = teamOverride?.trim() || country || euro || teamRaw;
  // seleções: traduz o país (Brazil → Brasil) e manda para a categoria "selecoes"
  const countryPt = country ?? COUNTRY[normLower(teamName)];
  const finalTeam = countryPt ?? teamName;
  const hit = classifyTeam(finalTeam);
  const team = finalTeam || null;
  // seleção (país) tem prioridade sobre retrô: camisa de seleção fica em "selecoes"
  const category = countryPt
    ? "selecoes"
    : isRetro
      ? "retro"
      : euro
        ? "europa"
        : hit?.category ?? "brasileirao";

  // TIPO — na ordem de prioridade dos padrões do fornecedor
  let tipo = "";
  if (cropTop) tipo = "Top Cropped"; // cropped feminino (substitui Home/Away)
  else if (/\bgoalkeeper\b|\bgk\b/i.test(clean)) tipo = "Goleiro"; // ignora cor (GK-Purple etc.)
  else if (/\bbrazil\s*edition\b|\bworld\s*cup\b|\bcopa do mundo\b/i.test(clean)) tipo = "Copa do Mundo";
  else if (/\bpre-?match\b/i.test(clean)) tipo = "Pré-Jogo";
  else if (/\btraining\b|\btreino\b/i.test(clean)) tipo = "Treino";
  // linhas casuais/edição de estilo do fornecedor
  else if (/\bterrace icons?\b/i.test(clean)) tipo = "Edição Terrace Icons";
  else if (/\boriginals?\b/i.test(clean)) tipo = /\bculture\b/i.test(clean) ? "Edição Originals Culture" : "Edição Originals";
  else if (/\bthird\b|\b3rd\b/i.test(clean)) tipo = /\bhome\b/i.test(clean) ? "Third Home" : "Third Away";
  else if (/\baway\b/i.test(clean)) tipo = "Away";
  else if (/\bhome\b/i.test(clean)) tipo = "Home";
  else if (/\bspecial\b/i.test(clean)) tipo = "Edição Especial";
  // "Superman Edition" → "Edição Superman"; "White Edition" → "Edição Branca"
  else if (/\b[\w-]+\s+edition\b/i.test(clean)) {
    const ed = clean.match(/\b([\w-]+)\s+edition\b/i);
    tipo = ed ? `Edição ${editionLabel(ed[1])}` : "Edição Especial";
  }
  // cor "solta" (sem outro modelo): "Bahia 26/27 White Jersey" → "Edição Branca"
  else if (colorRe.test(clean)) {
    const c = clean.match(colorRe);
    if (c) tipo = `Edição ${COLORS[c[1].toLowerCase()]}`;
  }
  // sem modelo no título → assume Home (padrão do fornecedor p/ camisa "lisa")
  if (!tipo && !cropTop) tipo = "Home";

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

  // Pré-Jogo: 129,90. Regra da promo: tudo até 189,90 entra no "Leve 3, Pague 2".
  const preJogo = tipo === "Pré-Jogo";
  // retrô só mantém 229,90 se for de 2016 pra trás; retrô 2017+ vira 189,90 e entra na promo
  const retroYear = isRetro ? Number((year.match(/(?:19|20)\d{2}/) ?? ["0"])[0]) : 0;
  const retroClassic = isRetro && retroYear > 0 && retroYear <= 2016;
  const special = retroClassic || (mangaLonga && !isRetro);
  const priceCents = preJogo ? reais(129.9) : special ? reais(229.9) : reais(189.9);
  const compareCents = preJogo ? reais(189.9) : special ? reais(299.9) : reais(269.9);
  const promo3x2 = priceCents <= reais(189.9);

  return { name, team, category, feminina, infantil, priceCents, compareCents, promo3x2 };
}
