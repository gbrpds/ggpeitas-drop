import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  // 1) Manga longa MU Pré-Jogo: 129,90 -> 229,90
  const a = await sql`UPDATE products SET price_cents=22990 WHERE active=true AND name ILIKE '%(Manga Longa)%' AND price_cents<>22990 RETURNING name,price_cents`;
  console.log("Manga longa reprecificadas ->", a.map((r: any) => r.name));
  // 2) Retrô 2017/18 Barcelona Third Away sem manga longa: 229,90 -> 189,90
  const b = await sql`UPDATE products SET price_cents=18990 WHERE active=true AND name='Camisa Barcelona Retrô 2017/18 - Third Away (Masculino)' AND price_cents=22990 RETURNING name`;
  console.log("Retrô 2017/18 corrigida ->", b.map((r: any) => r.name));
}
main().catch((e) => { console.error(e); process.exit(1); });
