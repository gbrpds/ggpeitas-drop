import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type Plan = { id: string; name: string; keep: string };
type R = { id: string; name: string; images: string[] | null };

const OUT = "scripts/dedup-review";
const CELL = 200, LABEL = 26, PADR = 6;

async function thumb(url: string | undefined, border: string): Promise<Buffer> {
  try {
    const buf = url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : Buffer.alloc(0);
    const img = await sharp(buf).resize(CELL - 8, CELL - 8, { fit: "contain", background: "#fff" }).png().toBuffer();
    return await sharp({ create: { width: CELL, height: CELL, channels: 3, background: border } })
      .composite([{ input: img, top: 4, left: 4 }]).png().toBuffer();
  } catch {
    return await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#ddd" } }).png().toBuffer();
  }
}

async function main() {
  const plan = JSON.parse(fs.readFileSync("scripts/dedup-plan.json", "utf8")) as Plan[];
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images FROM products`) as R[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  fs.mkdirSync(OUT, { recursive: true });

  // agrupa por keep
  const byKeep = new Map<string, string[]>();
  for (const p of plan) { const a = byKeep.get(p.keep) ?? []; a.push(p.id); byKeep.set(p.keep, a); }

  const entries = [...byKeep.entries()];
  const PER = 5; // clusters (linhas) por folha
  const MAXCOLS = 6; // keep + até 5 dels
  let sheetNo = 0;
  for (let i = 0; i < entries.length; i += PER) {
    sheetNo++;
    const batch = entries.slice(i, i + PER);
    const W = MAXCOLS * (CELL + PADR) + PADR;
    const H = batch.length * (CELL + LABEL + PADR) + PADR;
    const comp: { input: Buffer; top: number; left: number }[] = [];
    for (let r = 0; r < batch.length; r++) {
      const [keepId, delIds] = batch[r];
      const y = PADR + r * (CELL + LABEL + PADR);
      const keep = byId.get(keepId);
      // rótulo com nome
      const label = Buffer.from(`<svg width="${W}" height="${LABEL}"><rect width="${W}" height="${LABEL}" fill="#f4f4f4"/><text x="6" y="18" font-family="Arial" font-size="14" fill="#111">${(keep?.name ?? keepId).replace(/&/g, "&amp;").slice(0, 90)}</text></svg>`);
      comp.push({ input: label, top: y, left: 0 });
      // keep (verde)
      comp.push({ input: await thumb(keep?.images?.[0], "#0a7d34"), top: y + LABEL, left: PADR });
      // dels (vermelho)
      for (let c = 0; c < delIds.length && c < MAXCOLS - 1; c++) {
        const d = byId.get(delIds[c]);
        comp.push({ input: await thumb(d?.images?.[0], "#c62828"), top: y + LABEL, left: PADR + (c + 1) * (CELL + PADR) });
      }
    }
    await sharp({ create: { width: W, height: H, channels: 3, background: "#fff" } })
      .composite(comp).jpeg({ quality: 80 }).toFile(path.join(OUT, `dedup-${String(sheetNo).padStart(2, "0")}.jpg`));
    process.stderr.write(`\rfolha ${sheetNo}   `);
  }
  process.stderr.write("\n");
  console.log(`OK: ${sheetNo} folhas em ${OUT}/ (verde = mantida, vermelho = removida). Clusters: ${entries.length}, exclusões: ${plan.length}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
