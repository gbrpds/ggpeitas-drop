import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type R = {
  id: string; name: string; team: string | null; category: string;
  price_cents: number; compare_cents: number; promo3x2: boolean;
  active: boolean; feminina: boolean; infantil: boolean;
  images: string[] | null; source_id: string | null;
};
const key = (s?: string | null) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const nameBase = (n: string) => norm(n).replace(/\s*\((masculin[oa]|feminin[oa])\)\s*$/i, "").trim();
const SPECIAL = /\bregata\b|\bbaseball\b|\bvest\b|top cropped/i;
const season = (n: string) => { const m = n.match(/(\d{2,4})\/\d{2,4}/); if (m) return m[1].length === 4 ? +m[1] : 2000 + +m[1]; const y = n.match(/\b(?:19|20)\d{2}\b/); return y ? +y[0] : 0; };

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,team,category,price_cents,compare_cents,promo3x2,active,feminina,infantil,images,source_id FROM products`) as R[];
  const active = rows.filter((r) => r.active);
  const P = (label: string, items: string[], max = 20) => {
    const mark = items.length === 0 ? "✅" : "⚠️";
    console.log(`\n${mark} ${label}: ${items.length}`);
    items.slice(0, max).forEach((s) => console.log("   - " + s));
    if (items.length > max) console.log(`   … +${items.length - max}`);
  };

  console.log(`===== AUDITORIA MASTER =====`);
  console.log(`Total: ${rows.length} | ativos: ${active.length} | inativos: ${rows.length - active.length}`);
  const cat: Record<string, number> = {};
  for (const r of active) cat[r.category] = (cat[r.category] ?? 0) + 1;
  console.log("Categorias (ativos):", JSON.stringify(cat));

  // 1. nomes vagos
  P("Nomes vagos (sem modelo)", active.filter((r) => !/ - /.test(r.name) && !/\(manga longa\)/i.test(r.name) && !SPECIAL.test(r.name)).map((r) => `${r.name}`));

  // 2. duplicatas por nome
  const byName = new Map<string, R[]>();
  for (const r of active) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  P("Nomes DUPLICADOS", [...byName.values()].filter((g) => g.length > 1).map((g) => `${g[0].name} ×${g.length}`));

  // 3. fotos repetidas
  const byImg = new Map<string, Set<string>>();
  for (const r of rows) for (const u of r.images ?? []) (byImg.get(u) ?? byImg.set(u, new Set()).get(u)!).add(r.id);
  P("FOTOS repetidas (mesma URL em produtos diferentes)", [...byImg.entries()].filter(([, s]) => s.size > 1).map(([u, s]) => `${s.size}× ${u.split("/").pop()}`));

  // 4. source_id duplicado
  const bySrc = new Map<string, R[]>();
  for (const r of rows) if (r.source_id) (bySrc.get(r.source_id) ?? bySrc.set(r.source_id, []).get(r.source_id)!).push(r);
  P("SOURCE_ID duplicado", [...bySrc.values()].filter((g) => g.length > 1).map((g) => g.map((x) => x.name).join(" | ")));

  // 5. fotos faltando
  P("SEM foto", rows.filter((r) => !r.images || r.images.length === 0).map((r) => r.name));
  P("Só 1 foto (falta verso)", active.filter((r) => (r.images?.length ?? 0) === 1).map((r) => r.name));

  // 6. time nulo
  P("Time NULO", rows.filter((r) => !r.team).map((r) => r.name));

  // 7. preço fora do padrão
  const OK = new Set([12990, 18990, 22990, 16990]);
  P("Preço fora do padrão", active.filter((r) => !OK.has(r.price_cents)).map((r) => `R$${(r.price_cents / 100).toFixed(2)} · ${r.name}`));

  // 8. manga longa com preço errado (deveria ser 229,90)
  P("Manga Longa com preço != 229,90", active.filter((r) => /\(manga longa\)/i.test(r.name) && r.price_cents !== 22990).map((r) => `R$${(r.price_cents / 100).toFixed(2)} · ${r.name}`));

  // 9. candidatas a manga longa por FOTO (189,90 sem "Manga Longa" no nome) — revisão visual
  const mlCandidates = active.filter((r) => r.price_cents === 18990 && !/\(manga longa\)/i.test(r.name));
  console.log(`\nℹ️  Candidatas à revisão de manga longa por FOTO (189,90 sem "Manga Longa"): ${mlCandidates.length}`);
  if (process.argv.includes("--sheets")) await gerarFolhas(mlCandidates);

  // 10. retrô com preço fora da regra (<=2016 => 229,90 ; 2017+ => 189,90)
  const retroBad: string[] = [];
  for (const r of active) {
    if (!/retr[ôo]/i.test(r.name)) continue;
    if (/\(manga longa\)/i.test(r.name)) continue; // manga longa = 229,90 sempre
    const y = season(r.name); if (!y) continue;
    const esperado = y <= 2016 ? 22990 : 18990;
    if (r.price_cents !== esperado) retroBad.push(`${r.name} (${y}) R$${(r.price_cents / 100).toFixed(2)} → esperado R$${(esperado / 100).toFixed(2)}`);
  }
  P("Retrô com preço fora da regra (2016)", retroBad);

  // 11. grafia antiga de gênero
  P("(Masculina)/(Feminina) — grafia antiga", active.filter((r) => /\((masculina|feminina)\)/i.test(r.name)).map((r) => r.name));

  // 12. top cropped sem flag feminina
  P("Top Cropped sem flag feminina", active.filter((r) => /top cropped/i.test(r.name) && !r.feminina).map((r) => r.name));

  // 13. femininas sem par masculino
  const mascBases = new Set(active.filter((r) => /\(masculin[oa]\)/i.test(r.name)).map((r) => nameBase(r.name)));
  P("Femininas SEM par masculino", active.filter((r) => /\(feminin[oa]\)/i.test(r.name) && !mascBases.has(nameBase(r.name))).map((r) => r.name));

  // 14. nome "Camisa Camisa" / lixo
  P("Nome com 'Camisa Camisa' (sem time)", active.filter((r) => /camisa camisa/i.test(r.name)).map((r) => r.name));

  // 15. duplicatas de TIME por chave normalizada
  const teamByKey = new Map<string, Set<string>>();
  for (const r of active) if (r.team) { const k = key(r.team); (teamByKey.get(k) ?? teamByKey.set(k, new Set()).get(k)!).add(r.team); }
  P("Times DUPLICADOS (mesma chave, grafias diferentes)", [...teamByKey.values()].filter((s) => s.size > 1).map((s) => [...s].join(" | ")));

  console.log("\n===== FIM =====");
}

/** Gera folhas de contato (grades de miniaturas numeradas) das candidatas a
 *  manga longa, para revisão visual. Saída em scripts/ml-sheets/. */
async function gerarFolhas(items: R[]) {
  const OUT = "scripts/ml-sheets";
  const COLS = 5, ROWS = 5, CELL = 240, PER = COLS * ROWS;
  fs.mkdirSync(OUT, { recursive: true });
  const map: { idx: number; sheet: number; id: string; name: string }[] = [];
  console.log(`\nGerando folhas de ${items.length} candidatas em ${OUT}/ …`);
  let sheetNo = 0;
  for (let i = 0; i < items.length; i += PER) {
    sheetNo++;
    const batch = items.slice(i, i + PER);
    const cells: { input: Buffer; top: number; left: number }[] = [];
    for (let j = 0; j < batch.length; j++) {
      const r = batch[j];
      const gidx = i + j;
      map.push({ idx: gidx, sheet: sheetNo, id: r.id, name: r.name });
      let thumb: Buffer;
      try {
        const url = r.images?.[0];
        const buf = url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : Buffer.alloc(0);
        thumb = await sharp(buf).resize(CELL, CELL, { fit: "contain", background: "#fff" }).png().toBuffer();
      } catch {
        thumb = await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#ccc" } }).png().toBuffer();
      }
      const badge = Buffer.from(`<svg width="${CELL}" height="30"><rect width="64" height="26" fill="#0a7d34"/><text x="6" y="19" font-family="Arial" font-size="17" fill="#fff" font-weight="bold">${gidx}</text></svg>`);
      const withBadge = await sharp(thumb).composite([{ input: badge, top: 0, left: 0 }]).png().toBuffer();
      cells.push({ input: withBadge, top: Math.floor(j / COLS) * CELL, left: (j % COLS) * CELL });
    }
    await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: "#fff" } })
      .composite(cells).jpeg({ quality: 78 }).toFile(path.join(OUT, `sheet-${String(sheetNo).padStart(2, "0")}.jpg`));
    process.stdout.write(`sheet ${sheetNo} `);
  }
  fs.writeFileSync(path.join(OUT, "map.json"), JSON.stringify(map));
  console.log(`\nOK: ${sheetNo} folhas + map.json.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
