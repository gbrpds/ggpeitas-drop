import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";

type Plan = { id: string; name: string; keep: string };
type MapRow = { idx: number; id: string; name: string; price: number };
type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string; price_cents: number };

const APPLY = process.argv.includes("--apply");

// índices classificados como MANGA LONGA na revisão visual das folhas scripts/sleeves/
const LONG_IDX = new Set<number>([
  4,10,12,15,17,19, 31,46,48, 50,58,62,63,68,70,73, 76,77,81,85,87,90,96,97,98,
  102,106,109,112,114,115,117,124, 145,148, 150,152,154,156,158,160,162,163,167,169,
  177,181,193,195,196, 201,203,205,209,210,221, 266,268,270,272,
  278,282,284,286,288,289,292,293,296, 305,308,311,314,315,320, 325,326,329,
]);

// insere "(Manga Longa)" antes de " - modelo (gênero)"
function toMangaLonga(name: string): string {
  if (/\(manga longa\)/i.test(name)) return name;
  if (/ - /.test(name)) return name.replace(/ - /, " (Manga Longa) - ");
  return name.replace(/ \((Masculino|Feminino)\)\s*$/i, " (Manga Longa) ($1)");
}

async function main() {
  const plan = JSON.parse(fs.readFileSync("scripts/dedup-plan.json", "utf8")) as Plan[];
  const map = JSON.parse(fs.readFileSync("scripts/sleeves/map.json", "utf8")) as MapRow[];
  const longIds = new Set(map.filter((m) => LONG_IDX.has(m.idx)).map((m) => m.id));

  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at,price_cents FROM products`) as R[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const activeNames = new Set(rows.map((r) => r.name.toLowerCase())); // p/ detectar colisão de nome

  // reconstrói clusters (keep + seus dels)
  const clusters = new Map<string, string[]>();
  for (const p of plan) {
    const arr = clusters.get(p.keep) ?? [p.keep];
    if (!clusters.has(p.keep)) clusters.set(p.keep, arr);
    arr.push(p.id);
  }

  const better = (a: R, b: R) =>
    (a.source_id ? 1 : 0) - (b.source_id ? 1 : 0) ||
    ((a.images?.length ?? 0) - (b.images?.length ?? 0)) ||
    (+new Date(a.created_at) - +new Date(b.created_at));

  const renames: { id: string; from: string; to: string; price: number }[] = [];
  const deletes: { id: string; name: string; why: string }[] = [];

  for (const [, ids] of clusters) {
    const members = ids.map((id) => byId.get(id)!).filter(Boolean);
    const shorts = members.filter((m) => !longIds.has(m.id)).sort(better);
    const longs = members.filter((m) => longIds.has(m.id)).sort(better);

    // manga curta: sobrevive a melhor; resto deleta
    const shortKeep = shorts.pop();
    for (const s of shorts) deletes.push({ id: s.id, name: s.name, why: "cópia curta" });

    // manga longa: sobrevive a melhor (renomeada), resto deleta
    const longKeep = longs.pop();
    for (const l of longs) deletes.push({ id: l.id, name: l.name, why: "cópia longa" });
    if (longKeep) {
      const to = toMangaLonga(longKeep.name);
      // se já existe um produto com o nome de manga longa, esta é dup dele -> deleta
      if (activeNames.has(to.toLowerCase()) && to.toLowerCase() !== longKeep.name.toLowerCase()) {
        deletes.push({ id: longKeep.id, name: longKeep.name, why: "manga longa já existente" });
      } else {
        renames.push({ id: longKeep.id, from: longKeep.name, to, price: 22990 });
        activeNames.add(to.toLowerCase());
      }
    }
  }

  console.log(`Clusters: ${clusters.size}`);
  console.log(`RENAMES p/ Manga Longa (+R$229,90): ${renames.length}`);
  console.log(`DELETES (cópias reais da mesma manga): ${deletes.length}`);
  console.log(`\n--- Amostra renames ---`);
  renames.slice(0, 30).forEach((r) => console.log(`   ${r.from}  ->  ${r.to}`));
  console.log(`\n--- Amostra deletes ---`);
  deletes.slice(0, 30).forEach((d) => console.log(`   DEL ${d.name}  [${d.why}]`));

  fs.writeFileSync("scripts/final-plan.json", JSON.stringify({ renames, deletes }, null, 0));
  console.log(`\nPlano salvo em scripts/final-plan.json`);

  if (APPLY) {
    console.log(`\nAPLICANDO ${renames.length} renames + ${deletes.length} deletes...`);
    for (const r of renames) await sql`UPDATE products SET name=${r.to}, price_cents=${r.price} WHERE id=${r.id}`;
    const ids = deletes.map((d) => d.id);
    for (let i = 0; i < ids.length; i += 100) await sql`DELETE FROM products WHERE id = ANY(${ids.slice(i, i + 100)})`;
    console.log("OK aplicado.");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
