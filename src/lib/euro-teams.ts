/**
 * Times europeus (La Liga + grandes clubes) com apelidos, para reconhecer o
 * time em QUALQUER posição do título do fornecedor — que costuma variar muito
 * ("23-24 Barcelona", "long sleeve Real Madrid", "Cádiz CF", "Celta Vigo"...).
 * Consolida as variações num único nome canônico e classifica como "europa".
 *
 * Fonte única: `league` marca a coleção (ex.: "laliga") e `giant` marca os
 * "Gigantes Europeus" (vitrine com os grandes clubes do continente).
 */
export type League = "laliga" | "seriea" | "premier" | "bundesliga" | "ligue1";
export type EuroTeam = { name: string; keys: string[]; league?: League; giant?: boolean };

const key = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const EURO_TEAMS: EuroTeam[] = [
  // La Liga (conforme o menu do fornecedor)
  { name: "Real Madrid", keys: ["realmadrid"], league: "laliga", giant: true },
  { name: "Barcelona", keys: ["barcelona"], league: "laliga", giant: true },
  { name: "Atlético de Madrid", keys: ["atleticodemadrid", "atleticomadrid"], league: "laliga" },
  { name: "Athletic Bilbao", keys: ["athleticbilbao", "athleticclub"], league: "laliga" },
  { name: "Real Sociedad", keys: ["realsociedad"], league: "laliga" },
  { name: "Real Betis", keys: ["realbetis"], league: "laliga" },
  { name: "Celta de Vigo", keys: ["celtadevigo", "celtavigo", "celta"], league: "laliga" },
  { name: "Girona", keys: ["girona"], league: "laliga" },
  { name: "Villarreal", keys: ["villarreal"], league: "laliga" },
  { name: "Valencia", keys: ["valenciacf", "valencia"], league: "laliga" },
  { name: "Osasuna", keys: ["osasuna"], league: "laliga" },
  { name: "Sevilla", keys: ["sevillafc", "sevilla"], league: "laliga" },
  { name: "Rayo Vallecano", keys: ["rayovallecano"], league: "laliga" },
  { name: "Las Palmas", keys: ["laspalmas"], league: "laliga" },
  { name: "Deportivo Alavés", keys: ["deportivoalaves", "alaves"], league: "laliga" },
  { name: "Zaragoza", keys: ["realzaragoza", "zaragoza"], league: "laliga" },
  { name: "Cádiz", keys: ["cadizcf", "cadiz"], league: "laliga" },
  { name: "Deportivo La Coruña", keys: ["deportivolacoruna"], league: "laliga" },
  { name: "Córdoba", keys: ["cordoba"], league: "laliga" },
  { name: "Espanyol", keys: ["espanyol"], league: "laliga" },
  { name: "Getafe", keys: ["getafe"], league: "laliga" },
  { name: "Málaga", keys: ["malagacf", "malaga"], league: "laliga" },
  { name: "Tenerife", keys: ["cdtenerife", "tenerife"], league: "laliga" },
  { name: "Granada", keys: ["granada"], league: "laliga" },
  { name: "Real Valladolid", keys: ["realvalladolid", "valladolid"], league: "laliga" },
  { name: "Mallorca", keys: ["rcdmallorca", "mallorca"], league: "laliga" },
  { name: "Burgos", keys: ["burgoscf", "burgos"], league: "laliga" },
  { name: "Albacete", keys: ["albacete"], league: "laliga" },
  { name: "Sporting de Gijón", keys: ["sportingdegijon", "sportinggijon"], league: "laliga" },
  { name: "Elche", keys: ["elche"], league: "laliga" },
  { name: "Leganés", keys: ["leganes"], league: "laliga" },
  { name: "Racing de Santander", keys: ["racingdesantander", "racingsantander"], league: "laliga" },
  { name: "Real Murcia", keys: ["realmurcia", "murcia"], league: "laliga" },
  { name: "Real Oviedo", keys: ["realoviedo", "oviedo"], league: "laliga" },
  { name: "Huesca", keys: ["sdhuesca", "huesca"], league: "laliga" },
  { name: "Racing de Santander", keys: ["santander"], league: "laliga" },
  { name: "Levante", keys: ["levanteud", "levante"], league: "laliga" },
  { name: "Cartagena", keys: ["cartagena"], league: "laliga" },
  { name: "Basque Country", keys: ["basquecountry"], league: "laliga" },
  { name: "Hércules", keys: ["hercules"], league: "laliga" },
  { name: "Compostela", keys: ["compostela"], league: "laliga" },
  { name: "CD Castellón", keys: ["cdcastellon", "castellon"], league: "laliga" },
  { name: "UD Almería", keys: ["udalmeria", "almeria"], league: "laliga" },
  // Gigantes Europeus (grandes clubes do continente)
  { name: "Manchester United", keys: ["manchesterunited", "manutd", "manunited"], league: "premier", giant: true },
  { name: "Manchester City", keys: ["manchestercity", "mancity"], league: "premier", giant: true },
  { name: "Liverpool", keys: ["liverpool", "lfc"], league: "premier", giant: true },
  { name: "Chelsea", keys: ["chelsea"], league: "premier", giant: true },
  { name: "Juventus", keys: ["juventus", "juve", "juv"], league: "seriea", giant: true },
  { name: "Milan", keys: ["acmilan", "milan"], league: "seriea", giant: true },
  { name: "Internazionale", keys: ["internazionale", "intermilan"], league: "seriea", giant: true },
  { name: "Bayern de Munique", keys: ["bayernmunich", "bayernmunchen", "bayern"], league: "bundesliga", giant: true },
  { name: "Borussia Dortmund", keys: ["borussiadortmund", "dortmund"], league: "bundesliga", giant: true },
  { name: "Hamburgo", keys: ["hamburgersv", "hamburgo", "hamburg"], league: "bundesliga", giant: true },
  { name: "Ajax", keys: ["ajaxamsterdam", "afcajax", "ajax"], giant: true },
  { name: "Benfica", keys: ["slbenfica", "benfica"], giant: true },
  { name: "PSV", keys: ["psveindhoven", "psv"], giant: true },
  { name: "Olympique de Marseille", keys: ["olympiquedemarseille", "olympiquemarseille", "marseille"], league: "ligue1", giant: true },
  { name: "PSG", keys: ["parissaintgermain", "psg"], league: "ligue1", giant: false },
  // Premier League (Arsenal/Chelsea/Man City/Man United/Liverpool acima)
  { name: "Arsenal", keys: ["arsenal"], league: "premier" },
  { name: "Tottenham", keys: ["tottenhamhotspur", "tottenham", "spurs"], league: "premier" },
  { name: "West Ham United", keys: ["westhamunited", "westham"], league: "premier" },
  { name: "Wolverhampton", keys: ["wolverhampton", "wolves"], league: "premier" },
  { name: "Aston Villa", keys: ["astonvilla"], league: "premier" },
  { name: "Everton", keys: ["everton"], league: "premier" },
  { name: "Leicester City", keys: ["leicestercity", "leicester"], league: "premier" },
  { name: "Newcastle United", keys: ["newcastleunited", "newcastle"], league: "premier" },
  { name: "Crystal Palace", keys: ["crystalpalace"], league: "premier" },
  { name: "Brighton", keys: ["brightonhovealbion", "brighton"], league: "premier" },
  { name: "Fulham", keys: ["fulham"], league: "premier" },
  { name: "Sheffield Wednesday", keys: ["sheffieldwednesday"], league: "premier" },
  { name: "Sunderland", keys: ["sunderland"], league: "premier" },
  { name: "Southampton", keys: ["southampton"], league: "premier" },
  { name: "Birmingham City", keys: ["birminghamcity", "birmingham"], league: "premier" },
  { name: "Leeds United", keys: ["leedsunited", "leeds"], league: "premier" },
  { name: "Nottingham Forest", keys: ["nottinghamforest", "nottingham"], league: "premier" },
  { name: "Coventry City", keys: ["coventrycity", "coventry"], league: "premier" },
  { name: "Hull City", keys: ["hullcity"], league: "premier" },
  { name: "Blackburn Rovers", keys: ["blackburnrovers", "blackburn"], league: "premier" },
  { name: "Lincoln City", keys: ["lincolncity", "lincoln"], league: "premier" },
  { name: "Derby County", keys: ["derbycounty", "derby"], league: "premier" },
  { name: "Bradford City", keys: ["bradfordcity", "bradford"], league: "premier" },
  { name: "Plymouth Argyle", keys: ["plymouthargyle", "plymouth"], league: "premier" },
  { name: "Queens Park Rangers", keys: ["queensparkrangers", "qpr"], league: "premier" },
  { name: "Preston", keys: ["prestonnorthend", "preston"], league: "premier" },
  { name: "Portsmouth", keys: ["portsmouth"], league: "premier" },
  { name: "Bournemouth", keys: ["afcbournemouth", "bournemouth"], league: "premier" },
  { name: "Wrexham", keys: ["wrexham"], league: "premier" },
  // Serie A (Juventus/Milan/Internazionale acima)
  { name: "Napoli", keys: ["napoli", "naples"], league: "seriea" },
  { name: "Roma", keys: ["asroma", "roma", "rome"], league: "seriea" },
  { name: "Fiorentina", keys: ["fiorentina", "florence"], league: "seriea" },
  { name: "Atalanta", keys: ["atalanta"], league: "seriea" },
  { name: "Bologna", keys: ["bologna"], league: "seriea" },
  { name: "Lazio", keys: ["lazio"], league: "seriea" },
  { name: "Torino", keys: ["torino"], league: "seriea" },
  { name: "Parma", keys: ["parmacalcio", "parma"], league: "seriea" },
  { name: "Sampdoria", keys: ["sampdoria"], league: "seriea" },
  { name: "Brescia", keys: ["bresciacalcio", "brescia"], league: "seriea" },
  { name: "Venezia", keys: ["venezia"], league: "seriea" },
  { name: "Pisa", keys: ["pisa"], league: "seriea" },
  { name: "Bari", keys: ["sscbari", "bari"], league: "seriea" },
  { name: "Cremonese", keys: ["cremonese"], league: "seriea" },
  { name: "Sassuolo", keys: ["sassuolo"], league: "seriea" },
  { name: "Genoa", keys: ["genoa"], league: "seriea" },
  { name: "Padova", keys: ["padova"], league: "seriea" },
  { name: "Perugia", keys: ["perugia"], league: "seriea" },
];

// índice (chave → nome) e lista de chaves ordenada da mais longa para a mais curta
const KEY_TO_NAME = new Map<string, string>();
for (const t of EURO_TEAMS) for (const k of t.keys) if (!KEY_TO_NAME.has(k)) KEY_TO_NAME.set(k, t.name);
const KEYS_BY_LEN = [...KEY_TO_NAME.keys()].sort((a, b) => b.length - a.length);

const uniq = (a: string[]) => [...new Set(a)];

/** Nomes canônicos de todos os times da La Liga (para a coleção da home). */
export const LA_LIGA_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "laliga").map((t) => t.name));

/** Nomes canônicos de todos os times da Serie A (para a coleção da home). */
export const SERIE_A_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "seriea").map((t) => t.name));
export const PREMIER_LEAGUE_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "premier").map((t) => t.name));
export const BUNDESLIGA_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "bundesliga").map((t) => t.name));
export const LIGUE1_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "ligue1").map((t) => t.name));

/** Rótulo em PT de cada liga (para agrupar no filtro do admin). */
export const LEAGUE_LABEL: Record<League, string> = {
  laliga: "La Liga",
  seriea: "Serie A",
  premier: "Premier League",
  bundesliga: "Bundesliga",
  ligue1: "Ligue One",
};
const TEAMKEY_TO_LEAGUE = new Map<string, League>();
for (const t of EURO_TEAMS) if (t.league) TEAMKEY_TO_LEAGUE.set(key(t.name), t.league);
/** Liga (rótulo PT) de um time europeu, ou null se não for de liga mapeada. */
export function leagueOfTeam(name: string): string | null {
  const lg = TEAMKEY_TO_LEAGUE.get(key(name));
  return lg ? LEAGUE_LABEL[lg] : null;
}

/** Nomes canônicos dos "Gigantes Europeus" (vitrine dos grandes clubes). */
export const GIGANTES_EUROPEUS = uniq(EURO_TEAMS.filter((t) => t.giant).map((t) => t.name));

/** Conjunto de chaves normalizadas dos gigantes europeus (para filtro rápido). */
export const GIGANTES_EUROPEUS_KEYS = new Set(GIGANTES_EUROPEUS.map(key));

/** Acha um time europeu conhecido dentro do título (qualquer posição). */
export function resolveEuroTeam(title: string): string | null {
  const k = key(title);
  for (const alias of KEYS_BY_LEN) if (k.includes(alias)) return KEY_TO_NAME.get(alias)!;
  return null;
}
