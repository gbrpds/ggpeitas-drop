import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type Plan = { id: string; name: string; keep: string };
type R = { id: string; name: string; images: string[] | null; price_cents: number };

const OUT = "scripts/sleeves";
const CELL = 232, BADGE = 30, COLS = 5, ROWS = 5, PER = COLS * ROWS;

async function tile(url: string | undefined, idx: number): Promise<Buffer> {
  let base: Buffer;
  try {
    const buf = url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : Buffer.alloc(0);
    base = await sharp(buf).resize(CELL, CELL, { fit: "contain", background: "#fff" }).png().toBuffer();
  } catch {
    base = await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#ccc" } }).png().toBuffer();
  }
  const badge = Buffer.from(`<svg width="${CELL}" height="${BADGE}"><rect width="54" height="26" fill="#111"/><text x="6" y="20" font-family="Arial" font-size="18" fill="#fff" font-weight="bold">${idx}</text></svg>`);
  return await sharp(base).composite([{ input: badge, top: 0, left: 0 }]).png().toBuffer();
}

async function main() {
  const plan = JSON.parse(fs.readFileSync("scripts/dedup-plan.json", "utf8")) as Plan[];
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,price_cents FROM products`) as R[];
  const byId = new Map(rows.map((r) => [r.id, r]));

  // universo = todos os keeps + todos os dels (únicos)
  const ids = new Set<string>();
  for (const p of plan) { ids.add(p.keep); ids.add(p.id); }
  const list = [...ids].map((id) => byId.get(id)!).filter(Boolean);
  // ordena por nome pra agrupar visualmente os clusters
  list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
    await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: "#fff" } })
      .composite(cells).jpeg({ quality: 82 }).toFile(path.join(OUT, `s-${String(sheetNo).padStart(2, "0")}.jpg`));
    process.stderr.write(`\rfolha ${sheetNo}   `);
  }
  process.stderr.write("\n");
  fs.writeFileSync(path.join(OUT, "map.json"), JSON.stringify(map));
  console.log(`OK: ${sheetNo} folhas, ${list.length} tiles. map.json salvo.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
