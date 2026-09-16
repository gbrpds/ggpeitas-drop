import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const samples = [
  "Camisa Napoli 25/26 - Home (Masculino)",
  "Camisa Athletic Bilbao 25/26 - Home (Masculino)",
  "Camisa Real Madrid 25/26 - Edição Especial (Masculino)",
  "Camisa Manchester United Retrô 2008/09 - Away (Masculino)",
  "Camisa Alemanha 2026 - Home (Masculino)",
];
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at FROM products WHERE active=true`) as R[];
  for (const s of samples) {
    const g = rows.filter((r) => norm(r.name) === norm(s)).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    console.log(`\n=== ${s} (${g.length}) ===`);
    for (const r of g) {
      const img0 = (r.images?.[0] ?? "").split("/").pop();
      console.log(`  src=${r.source_id} created=${r.created_at} img0=${img0} nImg=${r.images?.length}`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
