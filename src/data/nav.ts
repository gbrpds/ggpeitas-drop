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
    groups: [
      {
        label: "Ligas",
        links: [
          { name: "Brasileirão", href: "/categoria/brasileirao" },
          { name: "Europa", href: "/categoria/europa" },
          { name: "Todos os clubes", href: "/categoria/futebol" },
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
          { name: "Todas as seleções", href: "/categoria/selecoes" },
        ],
      },
    ],
  },
  { label: "Feminina", href: "/categoria/feminina" },
  { label: "Conjunto Infantil", href: "/categoria/infantil" },
  { label: "Player Jogador (Authentic)", href: "/categoria/player" },
  { label: "Retrô", href: "/categoria/retro" },
];
