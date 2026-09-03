import type { JerseyColors } from "@/data/products";

export type Team = { name: string; colors: JerseyColors };

/** Times do Brasileirão para o modal "time de coração" (vendas p/ o Brasil). */
export const teams: Team[] = [
  { name: "Flamengo", colors: ["#c8102e", "#111111", "#ffffff"] },
  { name: "Palmeiras", colors: ["#0a5f2a", "#ffffff", "#0f8a3d"] },
  { name: "São Paulo", colors: ["#f4f4f4", "#c8102e", "#0d1b4b"] },
  { name: "Corinthians", colors: ["#111111", "#ffffff", "#ffffff"] },
  { name: "Santos", colors: ["#f4f4f4", "#111111", "#ffffff"] },
  { name: "Grêmio", colors: ["#0d80c1", "#111111", "#ffffff"] },
  { name: "Botafogo", colors: ["#111111", "#ffffff", "#ffffff"] },
  { name: "Atlético Mineiro", colors: ["#111111", "#ffffff", "#111111"] },
  { name: "Fluminense", colors: ["#4b1e2f", "#0f8a3d", "#ffffff"] },
  { name: "Atlético Paranaense", colors: ["#c8102e", "#111111", "#ffffff"] },
  { name: "Internacional", colors: ["#c8102e", "#ffffff", "#ffffff"] },
  { name: "Fortaleza", colors: ["#0d3a8a", "#c8102e", "#ffffff"] },
  { name: "Cruzeiro", colors: ["#0d3a8a", "#ffffff", "#ffffff"] },
  { name: "Vasco da Gama", colors: ["#111111", "#c8102e", "#ffffff"] },
  { name: "Bahia", colors: ["#0d80c1", "#c8102e", "#ffffff"] },
  { name: "Sport Recife", colors: ["#c8102e", "#111111", "#ffffff"] },
  { name: "Paysandu", colors: ["#0d3a8a", "#ffffff", "#ffffff"] },
  { name: "Vitória", colors: ["#c8102e", "#111111", "#ffffff"] },
  { name: "Remo", colors: ["#0a2a5c", "#ffffff", "#111111"] },
  { name: "Santa Cruz", colors: ["#c8102e", "#111111", "#ffffff"] },
  { name: "Confiança", colors: ["#0a2a5c", "#c8102e", "#ffffff"] },
  { name: "Náutico", colors: ["#c8102e", "#ffffff", "#111111"] },
  { name: "Ceará Sporting", colors: ["#111111", "#ffffff", "#0d3a8a"] },
  { name: "Chapecoense", colors: ["#0a7d34", "#ffffff", "#0f8a3d"] },
  { name: "Coritiba", colors: ["#0a5f2a", "#ffffff", "#111111"] },
  { name: "Red Bull Bragantino", colors: ["#ffffff", "#c8102e", "#111111"] },
  { name: "Cuiabá", colors: ["#0a7d34", "#ffc400", "#ffffff"] },
];
