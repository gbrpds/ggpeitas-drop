import { getAllActive } from "@/lib/catalog";
import type { Product } from "@/data/products";

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export type Gender = "masculino" | "feminina";

/** Gênero deduzido do nome padronizado. */
export function productGender(name: string): Gender {
  return /\(feminino\)|top cropped/i.test(name) ? "feminina" : "masculino";
}

/** Ano da camisa no nome (ex.: "25/26", "1997/98"). */
export function productYear(name: string): string | null {
  const m = name.match(/\b\d{2,4}\/\d{2,4}\b|\b(?:19|20)\d{2}\b/);
  return m ? m[0] : null;
}

/** Manga longa não tem versão feminina. */
export function isMangaLonga(name: string): boolean {
  return /manga longa/i.test(name);
}

/** Modelo/variação para casar as versões (home, away, third away, goleiro…). */
export function productTipo(name: string): string {
  const n = norm(name);
  if (n.includes("manga longa")) return "manga longa";
  if (n.includes("goleiro")) return "goleiro";
  if (n.includes("copa do mundo")) return "copa do mundo";
  if (n.includes("top cropped")) return "top cropped";
  if (n.includes("third home")) return "third home";
  if (n.includes("third")) return "third away"; // padrão da loja
  if (n.includes("away")) return "away";
  if (n.includes("home")) return "home";
  return "";
}

export type GenderInfo = { current: Gender; otherGender: Gender; otherHref: string | null };

/**
 * Descobre a versão do gênero oposto do MESMO modelo (mesmo time + ano + tipo).
 * Manga longa não tem feminina. Retorna href do produto irmão, ou null.
 */
export async function getGenderInfo(product: Product): Promise<GenderInfo> {
  const current = productGender(product.name);
  const otherGender: Gender = current === "masculino" ? "feminina" : "masculino";

  // manga longa não possui versão feminina
  if (isMangaLonga(product.name) && otherGender === "feminina") {
    return { current, otherGender, otherHref: null };
  }

  const year = productYear(product.name);
  const tipo = productTipo(product.name);
  const team = norm(product.team ?? "");

  let otherHref: string | null = null;
  try {
    const all = await getAllActive();
    const sib = all.find(
      (p) =>
        p.id !== product.id &&
        norm(p.team ?? "") === team &&
        productYear(p.name) === year &&
        productTipo(p.name) === tipo &&
        productGender(p.name) === otherGender,
    );
    if (sib) otherHref = `/produto/${sib.id}`;
  } catch {
    /* sem banco */
  }
  return { current, otherGender, otherHref };
}
