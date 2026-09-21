import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

// Apaga TODO o histórico de pedidos (eram todos testes). Irreversível.
const before = await sql`SELECT count(*)::int AS n FROM orders`;
await sql`DELETE FROM orders`;
const after = await sql`SELECT count(*)::int AS n FROM orders`;
console.log(`Pedidos antes: ${before[0].n} -> depois: ${after[0].n}. Histórico limpo.`);
