/** Coleções especiais (ligas/regiões) — cards largos no carrossel da home.
 *  Edite à vontade: title (rótulo), href (para onde leva), colors (gradiente
 *  de fallback) e image (fundo opcional — caminho em /public). */
export type LeagueCollection = { title: string; href: string; colors: [string, string]; image?: string };

import { LA_LIGA_TEAMS } from "@/lib/euro-teams";

const laLigaHref = `/busca?team=${encodeURIComponent(LA_LIGA_TEAMS.join(","))}`;

// dica: para filtrar por vários times use /busca?team=Time A,Time B,Time C
// banners: suba os arquivos em public/ligas/ (proporção 2:1, ex.: 800x400).
// enquanto o arquivo não existir, o gradiente de cor aparece como fallback.
export const leagueCollections: LeagueCollection[] = [
  { title: "Gigantes Europeus", href: "/categoria/europa", colors: ["#0a1a4f", "#1e63c9"], image: "/ligas/gigantes-europeus.jpg" },
  {
    title: "Premier League",
    href: "/busca?team=Manchester City,Manchester United,Liverpool,Chelsea,Arsenal",
    colors: ["#3d195b", "#963cbd"],
    image: "/ligas/premier-league.jpg",
  },
  { title: "La Liga", href: laLigaHref, colors: ["#c8102e", "#ffb703"], image: "/ligas/la-liga.jpg" },
  { title: "Serie A TIM", href: "/busca?team=Juventus,Milan,Inter de Milão", colors: ["#0b6e30", "#c8102e"], image: "/ligas/liga-italiana.jpg" },
  { title: "Bundesliga", href: "/busca?team=Bayern de Munique", colors: ["#111111", "#d20515"], image: "/ligas/bundesliga.jpg" },
  { title: "Ligue One", href: "/busca?team=PSG", colors: ["#0a1a4f", "#c8102e"], image: "/ligas/ligue-1.jpg" },
  { title: "Liga Argentina", href: "/busca?team=Boca Juniors,River Plate", colors: ["#6caee0", "#1b3a6b"], image: "/ligas/liga-argentina.jpg" },
];
