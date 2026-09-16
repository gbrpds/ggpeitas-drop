import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
import { yupooTitleToProduct, resolveCountry } from "../src/lib/yupoo";

function main() {
  // 1) sanity check do parser nos casos problemáticos
  const tests = [
    "long sleeve Spain Retro 2012 - Away",
    "retro shirt Spain Retro 1994 - Home",
    "Spain 2024 Home",
    "Women Spain Goalkeeper",
    "Flamengo Brazil Edition Jersey", // NÃO é seleção (é edição de clube)
    "Real Madrid 23-24 Home",
  ];
  console.log("=== parser ===");
  for (const t of tests) {
    const p = yupooTitleToProduct(t);
    console.log(`  "${t}" -> team=${p.team} | cat=${p.category}`);
  }

  return runMigration();
}

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id, name, team, category FROM products`) as {
    id: string;
    name: string;
    team: string | null;
    category: string;
  }[];
  let fixedName = 0,
    movedCat = 0,
    fixedTeam = 0,
    changed = 0;
  for (const r of rows) {
    const country = resolveCountry(r.team ?? "");
    if (!country) continue; // não é seleção
    const newTeam = country;
    const newCat = "selecoes";
    // reconstrói o nome: "Camisa <junk> [Retrô] <ano> ..." -> "Camisa <País> [Retrô] <ano> ..."
    const newName = r.name.replace(/^(Camisa\s+).*?(\s+(?:Retrô\s+)?\d)/i, `$1${country}$2`);
    if (r.team === newTeam && r.category === newCat && r.name === newName) continue;
    if (r.team !== newTeam) fixedTeam++;
    if (r.category !== newCat) movedCat++;
    if (r.name !== newName) fixedName++;
    await sql`UPDATE products SET team=${newTeam}, category=${newCat}, name=${newName} WHERE id=${r.id}`;
    changed++;
  }
  console.log(`\n=== migração ===\nprodutos alterados: ${changed} | time: ${fixedTeam} | categoria->selecoes: ${movedCat} | nome: ${fixedName}`);
  const bycat = (await sql`SELECT category, count(*)::int n FROM products WHERE team = ANY(${["Brasil", "Espanha", "Argentina", "Portugal", "França", "Alemanha", "Inglaterra", "Itália"]}) GROUP BY category ORDER BY category`) as { category: string; n: number }[];
  console.log("seleções por categoria:", bycat.map((x) => x.category + ":" + x.n).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
