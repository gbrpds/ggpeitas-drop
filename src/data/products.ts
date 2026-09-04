export type JerseyColors = [string, string, string];

export type Product = {
  id: string;
  name: string;
  category: string;
  now: number;
  was?: number;
  isNew?: boolean;
  colors: JerseyColors;
  images?: string[]; // fotos reais (Vercel Blob) — quando vazio, usa o mock (SVG)
  team?: string;
  version?: string;
  rating?: { avg: number; count: number }; // média e total de avaliações
  inStock?: boolean; // false = sem estoque (dropshipping) → "avise-me quando voltar"
  promo3x2?: boolean; // participa do "Leve 3, Pague 2"
};

export type ProductSection = {
  id: string;
  title: string;
  emoji: string;
  href: string;
  products: Product[];
};

/**
 * Dados de exemplo (mock) para a home. Estrutura já no formato que o
 * banco (Neon) vai devolver, então trocar por consulta real será direto.
 */
export const sections: ProductSection[] = [
  {
    id: "vendidos",
    title: "Mais Vendidos",
    emoji: "🔥",
    href: "/mais-vendidos",
    products: [
      { id: "v1", name: "Flamengo 25/26 Home — Torcedor", category: "brasil", now: 189.9, was: 269.0, colors: ["#c8102e", "#111", "#fff"] },
      { id: "v2", name: "Brasil 2026/27 Home", category: "selecoes", now: 189.9, was: 229.9, colors: ["#ffc400", "#0f8a3d", "#0f8a3d"] },
      { id: "v3", name: "Real Madrid 25/26 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#f4f4f4", "#ffc400", "#00529f"] },
      { id: "v4", name: "Palmeiras 25/26 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#0a5f2a", "#fff", "#0f8a3d"] },
      { id: "v5", name: "Argentina 24 Home", category: "selecoes", now: 199.9, was: 269.0, colors: ["#75aadb", "#fff", "#ffc400"] },
      { id: "v6", name: "Corinthians 25/26 Home", category: "brasil", now: 189.9, isNew: true, colors: ["#111", "#fff", "#fff"] },
    ],
  },
  {
    id: "selecoes",
    title: "Seleções · Copa 2026",
    emoji: "🏆",
    href: "/selecoes",
    products: [
      { id: "s1", name: "Brasil 2026/27 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#ffc400", "#0f8a3d", "#0f8a3d"] },
      { id: "s2", name: "Argentina 2026 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#75aadb", "#fff", "#ffc400"] },
      { id: "s3", name: "Portugal 2026 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#8a1420", "#0a5f2a", "#fff"] },
      { id: "s4", name: "França 2026 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#1b2a6b", "#fff", "#c8102e"] },
      { id: "s5", name: "Espanha 2026 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#b01020", "#f3c012", "#fff"] },
      { id: "s6", name: "Inglaterra 2026 Home", category: "selecoes", now: 189.9, was: 269.0, colors: ["#f4f4f4", "#1b2a6b", "#c8102e"] },
    ],
  },
  {
    id: "brasil",
    title: "Gigantes do Brasileirão",
    emoji: "🇧🇷",
    href: "/brasileirao",
    products: [
      { id: "b1", name: "Flamengo 26/27 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#c8102e", "#111", "#fff"] },
      { id: "b2", name: "Palmeiras 26/27 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#0a5f2a", "#fff", "#0f8a3d"] },
      { id: "b3", name: "São Paulo 26/27 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#f4f4f4", "#c8102e", "#0d1b4b"] },
      { id: "b4", name: "Cruzeiro 26/27 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#0d3a8a", "#fff", "#fff"] },
      { id: "b5", name: "Atlético-MG 26/27 Home", category: "brasil", now: 189.9, was: 269.0, colors: ["#111", "#fff", "#fff"] },
      { id: "b6", name: "Vasco 26/27 Home", category: "brasil", now: 189.9, isNew: true, colors: ["#111", "#c8102e", "#fff"] },
    ],
  },
  {
    id: "europa",
    title: "Elite Europeia",
    emoji: "🌍",
    href: "/europa",
    products: [
      { id: "e1", name: "Barcelona 26/27 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#a50044", "#004d98", "#ffc400"] },
      { id: "e2", name: "Real Madrid 26/27 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#f4f4f4", "#ffc400", "#00529f"] },
      { id: "e3", name: "Man. City 26/27 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#6caee0", "#0a1a4f", "#fff"] },
      { id: "e4", name: "PSG 26/27 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#0d1b4b", "#c8102e", "#fff"] },
      { id: "e5", name: "Bayern 26/27 Home", category: "europa", now: 189.9, isNew: true, colors: ["#c8102e", "#fff", "#0d1b4b"] },
      { id: "e6", name: "Liverpool 26/27 Home", category: "europa", now: 189.9, was: 269.0, colors: ["#c8102e", "#0a5f2a", "#ffc400"] },
    ],
  },
  {
    id: "retro",
    title: "Retrô Lendárias",
    emoji: "🕰️",
    href: "/retro",
    products: [
      { id: "r1", name: "Brasil 2002 — Ronaldo 9", category: "retro", now: 179.9, was: 239.9, colors: ["#ffc400", "#0f8a3d", "#0f8a3d"] },
      { id: "r2", name: "Barcelona 05/06 — Ronaldinho 10", category: "retro", now: 249.9, was: 299.0, colors: ["#a50044", "#004d98", "#ffc400"] },
      { id: "r3", name: "Milan 06/07 — Kaká 22", category: "retro", now: 249.9, was: 299.0, colors: ["#c8102e", "#111", "#fff"] },
      { id: "r4", name: "Argentina 86 — Maradona 10", category: "retro", now: 249.9, was: 299.0, colors: ["#75aadb", "#fff", "#111"] },
      { id: "r5", name: "Inter 09/10 — Eto'o 9", category: "retro", now: 249.9, was: 299.0, colors: ["#0d1b4b", "#111", "#ffc400"] },
      { id: "r6", name: "França 98 — Zidane 10", category: "retro", now: 179.9, was: 239.9, colors: ["#1b2a6b", "#fff", "#c8102e"] },
    ],
  },
];

export type Category = { name: string; href: string; colors: JerseyColors };

export const categories: Category[] = [
  { name: "Futebol", href: "/categoria/futebol", colors: ["#0f8a3d", "#ffc400", "#fff"] },
  { name: "Seleções", href: "/categoria/selecoes", colors: ["#ffc400", "#0f8a3d", "#0f8a3d"] },
  { name: "Feminina", href: "/categoria/feminina", colors: ["#c8102e", "#fff", "#fff"] },
  { name: "Infantil", href: "/categoria/infantil", colors: ["#0d1b4b", "#c8102e", "#fff"] },
  { name: "Retrô", href: "/categoria/retro", colors: ["#a50044", "#004d98", "#ffc400"] },
  { name: "Brasileirão", href: "/categoria/brasileirao", colors: ["#c8102e", "#111", "#fff"] },
  { name: "Europa", href: "/categoria/europa", colors: ["#6caee0", "#0a1a4f", "#fff"] },
  { name: "Retrô Lendárias", href: "/categoria/retro", colors: ["#f4f4f4", "#f3c012", "#00529f"] },
];
