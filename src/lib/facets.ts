/** Helpers de faceta compartilhados entre a busca e as páginas de categoria. */

export const GENDER_LABEL: Record<string, string> = { masculino: "Masculino", feminina: "Feminina" };

/** Gênero deduzido do nome padronizado do produto. */
export function genderOf(name: string): "feminina" | "masculino" {
  return /\(feminino\)|top cropped/i.test(name) ? "feminina" : "masculino";
}

/** Modelo/tipo (rótulo) deduzido do nome, para o filtro. */
export function modeloOf(name: string): string | null {
  if (/manga longa/i.test(name)) return "Manga Longa";
  if (/goleiro/i.test(name)) return "Goleiro";
  if (/copa do mundo/i.test(name)) return "Copa do Mundo";
  if (/top cropped/i.test(name)) return "Top Cropped";
  if (/third/i.test(name)) return "Third";
  if (/away/i.test(name)) return "Away";
  if (/home/i.test(name)) return "Home";
  return null;
}
