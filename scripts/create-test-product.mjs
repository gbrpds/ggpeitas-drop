import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

// se já existe, não duplica
const [dup] = await sql`SELECT id FROM products WHERE source_id='teste-pagamento-1real' LIMIT 1`;
if (dup) { console.log("Já existe:", dup.id, "-> https://ggpeitas.com.br/produto/" + dup.id); process.exit(0); }

// reaproveita as imagens de um produto ativo qualquer (só pra renderizar)
const [img] = await sql`SELECT images FROM products WHERE active=true AND jsonb_array_length(images) >= 1 LIMIT 1`;
const images = img?.images ?? [];

const [row] = await sql`
  INSERT INTO products (name, team, category, price_cents, compare_cents, version, images, active, in_stock, promo3x2, feminina, infantil, source_id)
  VALUES ('Produto de Teste - Pagamento (R$ 1)', 'Teste', 'brasileirao', 100, NULL, 'Torcedor', ${JSON.stringify(images)}::jsonb, true, true, false, false, false, 'teste-pagamento-1real')
  RETURNING id`;
console.log("Criado:", row.id);
console.log("URL:", "https://ggpeitas.com.br/produto/" + row.id);
