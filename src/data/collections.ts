/** Coleções especiais (ligas/regiões) — cards largos no carrossel da home.
 *  Edite à vontade: title (rótulo), href (para onde leva), colors (gradiente
 *  de fallback) e image (fundo opcional — caminho em /public). */
export type LeagueCollection = { title: string; href: string; colors: [string, string]; image?: string };

// link de busca escopado por liga: a busca restringe resultados E a lista de
// times àquela liga (ver src/lib/leagues.ts).
const leagueHref = (key: string) => `/busca?league=${key}`;

// banners: suba os arquivos em public/ligas/ (proporção 2:1, ex.: 1200x600).
// enquanto o arquivo não existir, o gradiente de cor aparece como fallback.
export const leagueCollections: LeagueCollection[] = [
  { title: "Brasileirão", href: leagueHref("brasileirao"), colors: ["#0a7d34", "#ffc400"], image: "/ligas/brasileirao.png" },
  { title: "Gigantes Europeus", href: "/categoria/europa", colors: ["#0a1a4f", "#1e63c9"], image: "/ligas/gigantes-europeus.png" },
  { title: "Premier League", href: leagueHref("premier"), colors: ["#3d195b", "#963cbd"], image: "/ligas/premier-league.png" },
  { title: "La Liga", href: leagueHref("laliga"), colors: ["#c8102e", "#ffb703"], image: "/ligas/la-liga.png" },
  { title: "Serie A TIM", href: leagueHref("seriea"), colors: ["#0b6e30", "#c8102e"], image: "/ligas/serie-a.png" },
  { title: "Bundesliga", href: leagueHref("bundesliga"), colors: ["#111111", "#d20515"], image: "/ligas/bundesliga.png" },
  { title: "Ligue One", href: leagueHref("ligue1"), colors: ["#0a1a4f", "#c8102e"], image: "/ligas/ligue-one.png" },
  { title: "Liga Argentina", href: leagueHref("argentina"), colors: ["#6caee0", "#1b3a6b"], image: "/ligas/lpf.png" },
  { title: "MLS", href: leagueHref("mls"), colors: ["#001f5b", "#c8102e"], image: "/ligas/mls.png" },
];
