/** Coleções especiais (ligas/regiões) — cards largos no carrossel da home.
 *  Edite à vontade: title (rótulo), href (para onde leva), colors (gradiente
 *  de fallback) e image (fundo opcional — caminho em /public). */
export type LeagueCollection = { title: string; href: string; colors: [string, string]; image?: string };

import { LA_LIGA_TEAMS, SERIE_A_TEAMS, PREMIER_LEAGUE_TEAMS, BUNDESLIGA_TEAMS, LIGUE1_TEAMS } from "@/lib/euro-teams";

// link de busca por lista de times, já com o título da liga (heading da busca)
const leagueHref = (title: string, teams: string[]) =>
  `/busca?team=${encodeURIComponent(teams.join(","))}&title=${encodeURIComponent(title)}`;

// banners: suba os arquivos em public/ligas/ (proporção 2:1, ex.: 800x400).
// enquanto o arquivo não existir, o gradiente de cor aparece como fallback.
export const leagueCollections: LeagueCollection[] = [
  { title: "Gigantes Europeus", href: "/categoria/europa", colors: ["#0a1a4f", "#1e63c9"], image: "/ligas/gigantes-europeus.png" },
  { title: "Premier League", href: leagueHref("Premier League", PREMIER_LEAGUE_TEAMS), colors: ["#3d195b", "#963cbd"], image: "/ligas/premier-league.png" },
  { title: "La Liga", href: leagueHref("La Liga", LA_LIGA_TEAMS), colors: ["#c8102e", "#ffb703"], image: "/ligas/la-liga.png" },
  { title: "Serie A TIM", href: leagueHref("Serie A TIM", SERIE_A_TEAMS), colors: ["#0b6e30", "#c8102e"], image: "/ligas/serie-a.png" },
  { title: "Bundesliga", href: leagueHref("Bundesliga", BUNDESLIGA_TEAMS), colors: ["#111111", "#d20515"], image: "/ligas/bundesliga.png" },
  { title: "Ligue One", href: leagueHref("Ligue One", LIGUE1_TEAMS), colors: ["#0a1a4f", "#c8102e"], image: "/ligas/ligue-one.png" },
  { title: "Liga Argentina", href: leagueHref("Liga Argentina", ["Boca Juniors", "River Plate"]), colors: ["#6caee0", "#1b3a6b"], image: "/ligas/lpf.png" },
];
