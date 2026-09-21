/** Slug de time para as páginas /time/[slug] (ex.: "Atlético-MG" -> "atletico-mg"). */
export const teamSlug = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
