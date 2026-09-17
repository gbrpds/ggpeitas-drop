import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";

// Aplica APENAS os deletes já revisados em scripts/final-groups-plan.json
// (duplicatas reais da mesma manga, confirmadas por imagem + hash).
async function main() {
  const plan = JSON.parse(fs.readFileSync("scripts/final-groups-plan.json", "utf8")) as {
    deletes: { id: string; name: string; why: string }[];
  };
  const ids = plan.deletes.map((d) => d.id);
  console.log(`Vou remover ${ids.length} duplicatas reais.`);
  const sql = neon(process.env.DATABASE_URL!);
  for (let i = 0; i < ids.length; i += 100) await sql`DELETE FROM products WHERE id = ANY(${ids.slice(i, i + 100)})`;
  console.log("OK, deletes aplicados.");
}
main().catch((e) => { console.error(e); process.exit(1); });
