/**
 * Times das Américas (fora do Brasil): MLS e Liga Argentina.
 * Reconhecimento por apelidos como no euro-teams; classificados na categoria
 * "mundo" (não são Europa, Brasileirão nem Seleção).
 */
export type AmTeam = { name: string; keys: string[]; league: "mls" | "argentina" };

const key = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const AMERICAS_TEAMS: AmTeam[] = [
  // MLS
  { name: "Inter Miami", keys: ["intermiami", "intermiamicf", "miami"], league: "mls" },
  { name: "LA Galaxy", keys: ["lagalaxy", "losangelesgalaxy", "galaxy"], league: "mls" },
  { name: "LAFC", keys: ["lafc", "losangelesfc"], league: "mls" },
  { name: "Seattle Sounders", keys: ["seattlesounders", "seattle"], league: "mls" },
  { name: "Atlanta United", keys: ["atlantaunited", "atlanta"], league: "mls" },
  { name: "Portland Timbers", keys: ["portlandtimbers", "portland"], league: "mls" },
  { name: "New York City FC", keys: ["newyorkcityfc", "nycfc"], league: "mls" },
  { name: "New York Red Bulls", keys: ["newyorkredbulls", "nyredbulls"], league: "mls" },
  { name: "Austin FC", keys: ["austinfc", "austin"], league: "mls" },
  { name: "Columbus Crew", keys: ["columbuscrew", "columbus"], league: "mls" },
  { name: "FC Cincinnati", keys: ["fccincinnati", "cincinnati"], league: "mls" },
  { name: "Philadelphia Union", keys: ["philadelphiaunion", "philadelphia"], league: "mls" },
  { name: "Orlando City", keys: ["orlandocity", "orlando"], league: "mls" },
  { name: "Chicago Fire", keys: ["chicagofire", "chicago"], league: "mls" },
  { name: "Toronto FC", keys: ["torontofc", "toronto"], league: "mls" },
  { name: "Nashville SC", keys: ["nashvillesc", "nashville"], league: "mls" },
  { name: "Minnesota United", keys: ["minnesotaunited", "minnesota"], league: "mls" },
  { name: "Sporting Kansas City", keys: ["sportingkansascity", "sportingkc"], league: "mls" },
  { name: "Houston Dynamo", keys: ["houstondynamo", "houston"], league: "mls" },
  { name: "FC Dallas", keys: ["fcdallas", "dallas"], league: "mls" },
  { name: "Colorado Rapids", keys: ["coloradorapids", "colorado"], league: "mls" },
  { name: "Real Salt Lake", keys: ["realsaltlake"], league: "mls" },
  { name: "San Jose Earthquakes", keys: ["sanjoseearthquakes", "sanjose"], league: "mls" },
  { name: "DC United", keys: ["dcunited"], league: "mls" },
  { name: "New England Revolution", keys: ["newenglandrevolution", "newengland"], league: "mls" },
  { name: "Vancouver Whitecaps", keys: ["vancouverwhitecaps", "vancouver"], league: "mls" },
  { name: "CF Montréal", keys: ["cfmontreal", "montreal"], league: "mls" },
  { name: "St. Louis City", keys: ["stlouiscity", "stlouis"], league: "mls" },
  { name: "Charlotte FC", keys: ["charlottefc", "charlotte"], league: "mls" },
  { name: "San Diego FC", keys: ["sandiegofc", "sandiego"], league: "mls" },
  // Liga Argentina (Liga Profesional)
  { name: "Boca Juniors", keys: ["bocajuniors", "boca"], league: "argentina" },
  { name: "River Plate", keys: ["riverplate", "river"], league: "argentina" },
  { name: "Racing Club", keys: ["racingclub", "racingavellaneda"], league: "argentina" },
  { name: "Independiente", keys: ["independiente"], league: "argentina" },
  { name: "San Lorenzo", keys: ["casanlorenzo", "sanlorenzo"], league: "argentina" },
  { name: "Estudiantes", keys: ["estudiantes"], league: "argentina" },
  { name: "Vélez Sarsfield", keys: ["velezsarsfield", "velez"], league: "argentina" },
  { name: "Newell's Old Boys", keys: ["newellsoldboys", "newells"], league: "argentina" },
  { name: "Rosario Central", keys: ["rosariocentral"], league: "argentina" },
  { name: "Talleres", keys: ["talleres"], league: "argentina" },
  { name: "Lanús", keys: ["lanus"], league: "argentina" },
  { name: "Banfield", keys: ["banfield"], league: "argentina" },
  { name: "Defensa y Justicia", keys: ["defensayjusticia"], league: "argentina" },
  { name: "Argentinos Juniors", keys: ["argentinosjuniors"], league: "argentina" },
  { name: "Gimnasia", keys: ["gimnasialaplata", "gimnasia"], league: "argentina" },
  { name: "Huracán", keys: ["huracan"], league: "argentina" },
  { name: "Tigre", keys: ["tigre"], league: "argentina" },
  { name: "Godoy Cruz", keys: ["godoycruz"], league: "argentina" },
  { name: "Central Córdoba", keys: ["centralcordoba"], league: "argentina" },
  { name: "Belgrano", keys: ["belgrano"], league: "argentina" },
  { name: "Platense", keys: ["platense"], league: "argentina" },
  { name: "Unión", keys: ["unionsantafe"], league: "argentina" },
  { name: "Sarmiento", keys: ["sarmiento"], league: "argentina" },
  { name: "Atlético Tucumán", keys: ["atleticotucuman"], league: "argentina" },
  { name: "Instituto", keys: ["institutocordoba"], league: "argentina" },
  { name: "Barracas Central", keys: ["barracascentral"], league: "argentina" },
];

const uniq = (a: string[]) => [...new Set(a)];
export const MLS_TEAMS = uniq(AMERICAS_TEAMS.filter((t) => t.league === "mls").map((t) => t.name));
export const ARGENTINA_TEAMS = uniq(AMERICAS_TEAMS.filter((t) => t.league === "argentina").map((t) => t.name));

const KEY_TO_NAME = new Map<string, string>();
for (const t of AMERICAS_TEAMS) for (const k of t.keys) if (!KEY_TO_NAME.has(k)) KEY_TO_NAME.set(k, t.name);
const KEYS_BY_LEN = [...KEY_TO_NAME.keys()].sort((a, b) => b.length - a.length);

/** Acha um time de MLS/Argentina no título (qualquer posição). */
export function resolveAmericasTeam(title: string): string | null {
  const k = key(title);
  for (const alias of KEYS_BY_LEN) if (k.includes(alias)) return KEY_TO_NAME.get(alias)!;
  return null;
}
