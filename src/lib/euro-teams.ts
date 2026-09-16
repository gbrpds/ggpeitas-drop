/**
 * Times europeus (La Liga + grandes clubes) com apelidos, para reconhecer o
 * time em QUALQUER posição do título do fornecedor — que costuma variar muito
 * ("23-24 Barcelona", "long sleeve Real Madrid", "Cádiz CF", "Celta Vigo"...).
 * Consolida as variações num único nome canônico e classifica como "europa".
 *
 * Fonte única: `league` marca a coleção (ex.: "laliga") e `giant` marca os
 * "Gigantes Europeus" (vitrine com os grandes clubes do continente).
 */
export type EuroTeam = { name: string; keys: string[]; league?: "laliga"; giant?: boolean };

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
  { name: "Manchester United", keys: ["manchesterunited", "manutd", "manunited"], giant: true },
  { name: "Manchester City", keys: ["manchestercity", "mancity"], giant: true },
  { name: "Liverpool", keys: ["liverpool", "lfc"], giant: true },
  { name: "Chelsea", keys: ["chelsea"], giant: true },
  { name: "Juventus", keys: ["juventus"], giant: true },
  { name: "Milan", keys: ["acmilan", "milan"], giant: true },
  { name: "Inter de Milão", keys: ["intermilan", "internazionale"], giant: true },
  { name: "Bayern de Munique", keys: ["bayernmunich", "bayernmunchen", "bayern"], giant: true },
  { name: "Borussia Dortmund", keys: ["borussiadortmund", "dortmund"], giant: true },
  { name: "Hamburgo", keys: ["hamburgersv", "hamburgo", "hamburg"], giant: true },
  { name: "Ajax", keys: ["ajaxamsterdam", "afcajax", "ajax"], giant: true },
  { name: "Benfica", keys: ["slbenfica", "benfica"], giant: true },
  { name: "PSV", keys: ["psveindhoven", "psv"], giant: true },
  { name: "Olympique de Marseille", keys: ["olympiquedemarseille", "olympiquemarseille", "marseille"], giant: true },
  { name: "PSG", keys: ["parissaintgermain", "psg"], giant: false },
  // Premier League (Arsenal/Chelsea/Man City/Man United/Liverpool acima)
  { name: "Arsenal", keys: ["arsenal"] },
  { name: "Tottenham", keys: ["tottenhamhotspur", "tottenham", "spurs"] },
  { name: "West Ham United", keys: ["westhamunited", "westham"] },
  { name: "Wolverhampton", keys: ["wolverhampton", "wolves"] },
  { name: "Aston Villa", keys: ["astonvilla"] },
  { name: "Everton", keys: ["everton"] },
  { name: "Leicester City", keys: ["leicestercity", "leicester"] },
  { name: "Newcastle United", keys: ["newcastleunited", "newcastle"] },
  { name: "Crystal Palace", keys: ["crystalpalace"] },
  { name: "Brighton", keys: ["brightonhovealbion", "brighton"] },
  { name: "Fulham", keys: ["fulham"] },
  { name: "Sheffield Wednesday", keys: ["sheffieldwednesday"] },
  { name: "Sunderland", keys: ["sunderland"] },
  { name: "Southampton", keys: ["southampton"] },
  { name: "Birmingham City", keys: ["birminghamcity", "birmingham"] },
  { name: "Leeds United", keys: ["leedsunited", "leeds"] },
  { name: "Nottingham Forest", keys: ["nottinghamforest", "nottingham"] },
  { name: "Coventry City", keys: ["coventrycity", "coventry"] },
  { name: "Hull City", keys: ["hullcity"] },
  { name: "Blackburn Rovers", keys: ["blackburnrovers", "blackburn"] },
  { name: "Lincoln City", keys: ["lincolncity", "lincoln"] },
  { name: "Derby County", keys: ["derbycounty", "derby"] },
  { name: "Bradford City", keys: ["bradfordcity", "bradford"] },
  { name: "Plymouth Argyle", keys: ["plymouthargyle", "plymouth"] },
  { name: "Queens Park Rangers", keys: ["queensparkrangers", "qpr"] },
  { name: "Preston", keys: ["prestonnorthend", "preston"] },
  { name: "Portsmouth", keys: ["portsmouth"] },
  { name: "Bournemouth", keys: ["afcbournemouth", "bournemouth"] },
  { name: "Wrexham", keys: ["wrexham"] },
];

// índice (chave → nome) e lista de chaves ordenada da mais longa para a mais curta
const KEY_TO_NAME = new Map<string, string>();
for (const t of EURO_TEAMS) for (const k of t.keys) if (!KEY_TO_NAME.has(k)) KEY_TO_NAME.set(k, t.name);
const KEYS_BY_LEN = [...KEY_TO_NAME.keys()].sort((a, b) => b.length - a.length);

const uniq = (a: string[]) => [...new Set(a)];

/** Nomes canônicos de todos os times da La Liga (para a coleção da home). */
export const LA_LIGA_TEAMS = uniq(EURO_TEAMS.filter((t) => t.league === "laliga").map((t) => t.name));

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
