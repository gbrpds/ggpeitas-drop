import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";

type R = { id: string; name: string; category: string; images: string[] | null; source_id: string | null; created_at: string };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
// retrô sem ano = "Retrô" seguido direto de " - " (sem 4 dígitos ou nn/nn entre)
const retroSemAno = (n: string) => /retr[ôo]\s+-\s/i.test(n);

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,category,images,source_id,created_at FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  let semAno = 0, comAno = 0;
  const comAnoList: string[] = [];
  for (const g of groups) {
    if (retroSemAno(g[0].name)) semAno++;
    else { comAno++; comAnoList.push(`${g[0].name} ×${g.length}`); }
  }
  console.log(`Grupos duplicados: ${groups.length}`);
  console.log(`  · Retrô SEM ano (nome genérico, provável camisa diferente): ${semAno} grupos`);
  console.log(`  · COM ano/temporada (provável duplicata REAL): ${comAno} grupos`);
  console.log(`\n=== COM ano/temporada (candidatos a duplicata real) ===`);
  comAnoList.sort().forEach((s) => console.log("   " + s));
}
main().catch((e) => { console.error(e); process.exit(1); });
