export type NavGroup = { label: string; links: { name: string; href: string }[] };

export type NavItem = {
  label: string;
  emoji?: string;
  href?: string;
  groups?: NavGroup[];
};

// link de filtro por time (busca por time exato)
const team = (name: string) => ({ name, href: `/busca?team=${encodeURIComponent(name)}` });

export const navItems: NavItem[] = [
  { label: "Início", href: "/" },
  {
    label: "Futebol",
    groups: [
      {
        label: "Brasileirão",
        links: [
          team("Flamengo"),
          team("Palmeiras"),
          team("Corinthians"),
          team("São Paulo"),
          team("Grêmio"),
          team("Internacional"),
          team("Cruzeiro"),
          team("Atlético-MG"),
          team("Vasco"),
          team("Botafogo"),
          team("Fluminense"),
          team("Santos"),
        ],
      },
      {
        label: "Europa",
        links: [
          team("Real Madrid"),
          team("Barcelona"),
          team("Manchester City"),
          team("Manchester United"),
          team("Liverpool"),
          team("PSG"),
          team("Bayern de Munique"),
          team("Juventus"),
          team("Milan"),
          team("Inter de Milão"),
          team("Chelsea"),
          team("Arsenal"),
        ],
      },
    ],
  },
  {
    label: "Seleções",
    groups: [
      {
        label: "Seleções",
        links: [
          team("Brasil"),
          team("Argentina"),
          team("Portugal"),
          team("França"),
          team("Espanha"),
          team("Inglaterra"),
          team("Alemanha"),
          team("Itália"),
        ],
      },
    ],
  },
  { label: "Feminina", href: "/categoria/feminina" },
  { label: "Conjunto Infantil", href: "/categoria/infantil" },
  { label: "Player Jogador (Authentic)", href: "/categoria/player" },
  { label: "Retrô", href: "/categoria/retro" },
];
