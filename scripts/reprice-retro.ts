import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
import { seasonScore } from "../src/lib/facets";

const APPLY = process.argv.includes("--apply");

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id, name, price_cents, compare_cents, promo3x2 FROM products WHERE name ILIKE ${"%Retrô%"}`) as {
    id: string;
    name: string;
    price_cents: number;
    compare_cents: number;
    promo3x2: boolean;
  }[];
  let classic = 0,
    promo = 0,
    noYear = 0,
    changed = 0;
  for (const r of rows) {
    const y = seasonScore(r.name);
    if (!y) {
      noYear++;
      continue; // sem ano: não mexe
    }
    const price = y <= 2016 ? 22990 : 18990;
    const compare = y <= 2016 ? 29990 : 26990;
    const promo3x2 = price <= 18990;
    if (y <= 2016) classic++;
    else promo++;
    const needs = r.price_cents !== price || r.compare_cents !== compare || r.promo3x2 !== promo3x2;
    if (needs && APPLY) {
      await sql`UPDATE products SET price_cents=${price}, compare_cents=${compare}, promo3x2=${promo3x2} WHERE id=${r.id}`;
      changed++;
    } else if (needs) {
      changed++;
    }
  }
  console.log(
    `${APPLY ? "APLICADO" : "DRY-RUN"} | retrôs: ${rows.length} | <=2016 (229,90): ${classic} | 2017+ (189,90 promo): ${promo} | sem ano (mantidos): ${noYear} | a alterar: ${changed}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
