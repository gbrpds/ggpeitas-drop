/** Mapa de ligas -> times, usado pelos cards de liga e pela busca para
 *  escopar a faceta "Time" (ex.: card da MLS mostra só os times da MLS). */
import { LA_LIGA_TEAMS, SERIE_A_TEAMS, PREMIER_LEAGUE_TEAMS, BUNDESLIGA_TEAMS, LIGUE1_TEAMS } from "@/lib/euro-teams";
import { MLS_TEAMS, ARGENTINA_TEAMS } from "@/lib/americas";

// Todos os times do Brasileirão (nomes como aparecem nos produtos)
export const BRASIL_TEAMS = [
  "Flamengo", "Palmeiras", "Corinthians", "São Paulo", "Grêmio", "Internacional",
  "Cruzeiro", "Atlético-MG", "Atlético Paranaense", "Vasco da Gama", "Botafogo",
  "Fluminense", "Santos", "Bahia", "Fortaleza", "Sport Recife", "Ceará Sporting",
  "Coritiba", "Cuiabá", "Chapecoense", "Red Bull Bragantino", "Vitória", "Náutico",
  "Paysandu", "Remo", "Santa Cruz", "Confiança",
];

export type League = { key: string; title: string; teams: string[] };

export const LEAGUES: Record<string, League> = {
  brasileirao: { key: "brasileirao", title: "Brasileirão", teams: BRASIL_TEAMS },
  premier: { key: "premier", title: "Premier League", teams: PREMIER_LEAGUE_TEAMS },
  laliga: { key: "laliga", title: "La Liga", teams: LA_LIGA_TEAMS },
  seriea: { key: "seriea", title: "Serie A TIM", teams: SERIE_A_TEAMS },
  bundesliga: { key: "bundesliga", title: "Bundesliga", teams: BUNDESLIGA_TEAMS },
  ligue1: { key: "ligue1", title: "Ligue One", teams: LIGUE1_TEAMS },
  argentina: { key: "argentina", title: "Liga Argentina", teams: ARGENTINA_TEAMS },
  mls: { key: "mls", title: "MLS", teams: MLS_TEAMS },
};

export function getLeague(key?: string | null): League | null {
  if (!key) return null;
  return LEAGUES[key.toLowerCase()] ?? null;
}
