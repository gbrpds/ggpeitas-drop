import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string; price_cents: number };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const OUT = "scripts/groups-tiles";
const CELL = 232, BADGE = 30, COLS = 5, ROWS = 5, PER = COLS * ROWS;

async function tile(url: string | undefined, idx: number): Promise<Buffer> {
  let base: Buffer;
  try {
    const buf = url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : Buffer.alloc(0);
    base = await sharp(buf).resize(CELL, CELL, { fit: "contain", background: "#fff" }).png().toBuffer();
  } catch { base = await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#ccc" } }).png().toBuffer(); }
  const badge = Buffer.from(`<svg width="${CELL}" height="${BADGE}"><rect width="58" height="26" fill="#111"/><text x="5" y="20" font-family="Arial" font-size="17" fill="#fff" font-weight="bold">${idx}</text></svg>`);
  return await sharp(base).composite([{ input: badge, top: 0, left: 0 }]).png().toBuffer();
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at,price_cents FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);
  // ordena por nome para membros do mesmo grupo ficarem adjacentes/na mesma folha
  const list = groups.flat().sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || (+new Date(a.created_at) - +new Date(b.created_at)));

  fs.mkdirSync(OUT, { recursive: true });
  const map: { idx: number; id: string; name: string; price: number }[] = [];
  let sheetNo = 0;
  for (let i = 0; i < list.length; i += PER) {
    sheetNo++;
    const batch = list.slice(i, i + PER);
    const cells: { input: Buffer; top: number; left: number }[] = [];
    for (let j = 0; j < batch.length; j++) {
      const gidx = i + j;
      map.push({ idx: gidx, id: batch[j].id, name: batch[j].name, price: batch[j].price_cents });
      cells.push({ input: await tile(batch[j].images?.[0], gidx), top: Math.floor(j / COLS) * CELL, left: (j % COLS) * CELL });
    }
    await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: "#fff" } }).composite(cells).jpeg({ quality: 82 }).toFile(path.join(OUT, `g-${String(sheetNo).padStart(2, "0")}.jpg`));
    process.stderr.write(`\rfolha ${sheetNo}   `);
  }
  process.stderr.write("\n");
  fs.writeFileSync(path.join(OUT, "map.json"), JSON.stringify(map));
  console.log(`OK: ${sheetNo} folhas, ${list.length} tiles.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
