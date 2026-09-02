export type NavGroup = { label: string; links: { name: string; href: string }[] };

export type NavItem = {
  label: string;
  emoji?: string;
  href?: string;
  groups?: NavGroup[];
};

export const navItems: NavItem[] = [
  { label: "Início", href: "/" },
  {
    label: "Futebol",
    emoji: "⚽",
    groups: [
      {
        label: "Brasileirão",
        links: [
          { name: "Flamengo", href: "/brasileirao/flamengo" },
          { name: "Palmeiras", href: "/brasileirao/palmeiras" },
          { name: "Corinthians", href: "/brasileirao/corinthians" },
          { name: "São Paulo", href: "/brasileirao/sao-paulo" },
        ],
      },
      {
        label: "Europa",
        links: [
          { name: "Premier League", href: "/europa/premier-league" },
          { name: "La Liga", href: "/europa/la-liga" },
          { name: "Serie A", href: "/europa/serie-a" },
          { name: "Bundesliga", href: "/europa/bundesliga" },
          { name: "Ligue 1", href: "/europa/ligue-1" },
        ],
      },
    ],
  },
  {
    label: "Seleções",
    emoji: "🌎",
    groups: [
      {
        label: "Mais buscadas",
        links: [
          { name: "Brasil", href: "/selecoes/brasil" },
          { name: "Argentina", href: "/selecoes/argentina" },
          { name: "Portugal", href: "/selecoes/portugal" },
          { name: "França", href: "/selecoes/franca" },
          { name: "Espanha", href: "/selecoes/espanha" },
          { name: "Inglaterra", href: "/selecoes/inglaterra" },
          { name: "Itália", href: "/selecoes/italia" },
          { name: "Alemanha", href: "/selecoes/alemanha" },
        ],
      },
    ],
  },
  { label: "Feminina", emoji: "👩", href: "/feminina" },
  { label: "Conjunto Infantil", emoji: "💫", href: "/infantil" },
  { label: "Player Jogador (Authentic)", emoji: "⭐", href: "/player" },
  { label: "Retrô", emoji: "🕰️", href: "/retro" },
];
