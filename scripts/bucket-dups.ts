import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
type R = { id: string; name: string; images: string[] | null; source_id: string | null };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const isImporterImg = (r: R) => (r.images?.[0] ?? "").split("/").pop()?.startsWith("yupoo-") ?? false;
const genericEdition = (n: string) => /edição especial|edição preta|edição branca|edição azul|edição verde|pré-jogo|goleiro|edição originals|edição terrace/i.test(n);

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  let staleExtra = 0;         // produtos removíveis: src=null OU img não-importer, tendo irmão importer
  let genericGroups = 0, genericExtra = 0;   // grupos de nome genérico (edição/goleiro/etc) — NÃO deletar
  let standardGroups = 0, standardExtra = 0; // modelo padrão (Home/Away/Third/ano) — ambíguo
  const staleList: string[] = [];

  for (const g of groups) {
    const hasImporter = g.some(isImporterImg);
    const stale = g.filter((r) => !r.source_id || !isImporterImg(r));
    // remoção segura: sobra pelo menos 1 importer no grupo e há membros stale
    if (hasImporter && stale.length > 0 && stale.length < g.length) {
      staleExtra += stale.length;
      for (const r of stale) staleList.push(`${r.name}  (src=${r.source_id ?? "null"})`);
    }
    if (genericEdition(g[0].name)) { genericGroups++; genericExtra += g.length - 1; }
    else { standardGroups++; standardExtra += g.length - 1; }
  }
  console.log(`Grupos duplicados: ${groups.length}`);
  console.log(`\nA) STALE removíveis com segurança (src=null ou foto não-importer, com irmão importer no grupo): ${staleExtra} produtos`);
  staleList.slice(0, 60).forEach((s) => console.log("   - " + s));
  if (staleList.length > 60) console.log(`   … +${staleList.length - 60}`);
  console.log(`\nB) Nome genérico (Edição/Goleiro/Pré-Jogo) — camisas DISTINTAS, precisam renomear por foto: ${genericGroups} grupos, ${genericExtra} excedentes`);
  console.log(`C) Modelo padrão mesmo ano (Home/Away/Third) — ambíguo (re-list do fornecedor ou dup real): ${standardGroups} grupos, ${standardExtra} excedentes`);
}
main().catch((e) => { console.error(e); process.exit(1); });
