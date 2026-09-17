import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const editionRe = /edição\s+(especial|preta|branca|azul|verde|roxa|cinza|joint|originals|terrace|co-branded|comemorativa|anivers|campeão)/i;
const isC = (n: string) => !/retr[ôo]\s+-\s/i.test(n) && !editionRe.test(n) && / - (home|away|third away|goleiro|pré-jogo|pre-jogo)\b/i.test(n);
const APPLY = process.argv.includes("--apply");
const OUT = "scripts/dedupC-review";
const CELL = 200, LABEL = 26, PADR = 6, MAXCOLS = 6, PERSHEET = 5;

async function thumb(url: string | undefined, border: string): Promise<Buffer> {
  try {
    const buf = url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : Buffer.alloc(0);
    const img = await sharp(buf).resize(CELL - 8, CELL - 8, { fit: "contain", background: "#fff" }).png().toBuffer();
    return await sharp({ create: { width: CELL, height: CELL, channels: 3, background: border } }).composite([{ input: img, top: 4, left: 4 }]).png().toBuffer();
  } catch { return await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#ddd" } }).png().toBuffer(); }
}
const better = (a: R, b: R) => (a.source_id ? 1 : 0) - (b.source_id ? 1 : 0) || ((a.images?.length ?? 0) - (b.images?.length ?? 0)) || (+new Date(a.created_at) - +new Date(b.created_at));

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1 && isC(g[0].name));

  const plan: { keep: R; dels: R[] }[] = [];
  for (const g of groups) { const s = g.slice().sort(better); const keep = s.pop()!; plan.push({ keep, dels: s }); }
  const totalDel = plan.reduce((a, p) => a + p.dels.length, 0);
  console.log(`Categoria C: ${groups.length} grupos, ${totalDel} deletes (mantém 1 por nome).`);

  if (APPLY) {
    const ids = plan.flatMap((p) => p.dels.map((d) => d.id));
    for (let i = 0; i < ids.length; i += 100) await sql`DELETE FROM products WHERE id = ANY(${ids.slice(i, i + 100)})`;
    console.log(`APLICADO: ${ids.length} deletes.`);
    return;
  }

  // gera folhas de conferência keep(verde) × dels(vermelho)
  fs.mkdirSync(OUT, { recursive: true });
  let sheetNo = 0;
  for (let i = 0; i < plan.length; i += PERSHEET) {
    sheetNo++;
    const batch = plan.slice(i, i + PERSHEET);
    const W = MAXCOLS * (CELL + PADR) + PADR, H = batch.length * (CELL + LABEL + PADR) + PADR;
    const comp: { input: Buffer; top: number; left: number }[] = [];
    for (let r = 0; r < batch.length; r++) {
      const y = PADR + r * (CELL + LABEL + PADR);
      const lbl = Buffer.from(`<svg width="${W}" height="${LABEL}"><rect width="${W}" height="${LABEL}" fill="#f4f4f4"/><text x="6" y="18" font-family="Arial" font-size="14" fill="#111">${batch[r].keep.name.replace(/&/g, "&amp;").slice(0, 95)}</text></svg>`);
      comp.push({ input: lbl, top: y, left: 0 });
      comp.push({ input: await thumb(batch[r].keep.images?.[0], "#0a7d34"), top: y + LABEL, left: PADR });
      for (let c = 0; c < batch[r].dels.length && c < MAXCOLS - 1; c++)
        comp.push({ input: await thumb(batch[r].dels[c].images?.[0], "#c62828"), top: y + LABEL, left: PADR + (c + 1) * (CELL + PADR) });
    }
    await sharp({ create: { width: W, height: H, channels: 3, background: "#fff" } }).composite(comp).jpeg({ quality: 80 }).toFile(path.join(OUT, `c-${String(sheetNo).padStart(2, "0")}.jpg`));
    process.stderr.write(`\rfolha ${sheetNo}   `);
  }
  process.stderr.write("\n");
  fs.writeFileSync("scripts/dedupC-plan.json", JSON.stringify(plan.map((p) => ({ keep: p.keep.id, keepName: p.keep.name, dels: p.dels.map((d) => d.id) })), null, 0));
  console.log(`OK: ${sheetNo} folhas em ${OUT}/ + dedupC-plan.json`);
}
main().catch((e) => { console.error(e); process.exit(1); });
