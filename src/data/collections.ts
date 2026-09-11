/** Coleções especiais (ligas/regiões) — cards largos no carrossel da home.
 *  Edite à vontade: title (rótulo), href (para onde leva) e colors (gradiente). */
export type LeagueCollection = { title: string; href: string; colors: [string, string] };

// dica: para filtrar por vários times use /busca?team=Time A,Time B,Time C
export const leagueCollections: LeagueCollection[] = [
  { title: "Gigantes Europeus", href: "/categoria/europa", colors: ["#0a1a4f", "#1e63c9"] },
  {
    title: "Premier League",
    href: "/busca?team=Manchester City,Manchester United,Liverpool,Chelsea,Arsenal",
    colors: ["#3d195b", "#963cbd"],
  },
  { title: "La Liga", href: "/busca?team=Real Madrid,Barcelona", colors: ["#c8102e", "#ffb703"] },
  { title: "Liga Italiana", href: "/busca?team=Juventus,Milan,Inter de Milão", colors: ["#0b6e30", "#c8102e"] },
  { title: "Bundesliga", href: "/busca?team=Bayern de Munique", colors: ["#111111", "#d20515"] },
  { title: "Ligue 1", href: "/busca?team=PSG", colors: ["#0a1a4f", "#c8102e"] },
  { title: "Liga Argentina", href: "/busca?team=Boca Juniors,River Plate", colors: ["#6caee0", "#1b3a6b"] },
];
