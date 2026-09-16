import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const APPLY = process.argv.includes("--apply");
const THRESH = 6; // hamming <= 6 (de 64 bits) => mesma imagem

// average-hash 8x8 sobre a média (retorna BigInt de 64 bits)
async function aHash(url: string): Promise<bigint | null> {
  try {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const raw = await sharp(buf).greyscale().resize(8, 8, { fit: "fill" }).raw().toBuffer();
    let sum = 0;
    for (const v of raw) sum += v;
    const avg = sum / raw.length;
    let h = 0n;
    for (let i = 0; i < 64; i++) h = (h << 1n) | (raw[i] >= avg ? 1n : 0n);
    return h;
  } catch { return null; }
}
const ham = (a: bigint, b: bigint) => { let x = a ^ b, c = 0; while (x) { c += Number(x & 1n); x >>= 1n; } return c; };

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  let trueDupProducts = 0, distinctKept = 0;
  const toDelete: { id: string; name: string; keep: string }[] = [];
  const distinctReport: string[] = [];
  let gi = 0;
  for (const g of groups) {
    gi++;
    process.stderr.write(`\rgrupo ${gi}/${groups.length}   `);
    // hash da 1ª imagem de cada membro
    const hs = await Promise.all(g.map(async (r) => ({ r, h: r.images?.[0] ? await aHash(r.images[0]) : null })));
    // clusteriza por hamming
    const used = new Array(hs.length).fill(false);
    const clusters: number[][] = [];
    for (let i = 0; i < hs.length; i++) {
      if (used[i]) continue;
      const cl = [i]; used[i] = true;
      for (let j = i + 1; j < hs.length; j++) {
        if (used[j]) continue;
        if (hs[i].h != null && hs[j].h != null && ham(hs[i].h!, hs[j].h!) <= THRESH) { cl.push(j); used[j] = true; }
      }
      clusters.push(cl);
    }
    if (clusters.length < g.length) {
      // há duplicata real em algum cluster
      for (const cl of clusters) {
        if (cl.length < 2) continue;
        // mantém: preferir yupoo-source + mais imagens + mais recente
        const membs = cl.map((k) => hs[k].r);
        const keep = membs.slice().sort((a, b) =>
          (a.source_id ? 1 : 0) - (b.source_id ? 1 : 0) ||
          ((a.images?.length ?? 0) - (b.images?.length ?? 0)) ||
          (+new Date(a.created_at) - +new Date(b.created_at))
        ).pop()!;
        for (const m of membs) if (m.id !== keep.id) { toDelete.push({ id: m.id, name: m.name, keep: keep.id }); trueDupProducts++; }
      }
    }
    if (clusters.length > 1) { distinctKept += clusters.length; distinctReport.push(`${g[0].name}: ${clusters.length} designs distintos`); }
  }
  process.stderr.write("\n");
  console.log(`\nGrupos de nome duplicado: ${groups.length}`);
  console.log(`Produtos que são DUPLICATA REAL de imagem (deletáveis): ${trueDupProducts}`);
  console.log(`Grupos com >1 design distinto (mantidos): ${distinctReport.length}`);
  console.log(`\n--- Amostra de duplicatas reais a remover (primeiras 40) ---`);
  toDelete.slice(0, 40).forEach((d) => console.log(`   DEL ${d.name}  (mantém ${d.keep})`));
  console.log(`\n--- Amostra de grupos com designs distintos (mantidos) ---`);
  distinctReport.slice(0, 25).forEach((s) => console.log("   " + s));

  fs.writeFileSync("scripts/dedup-plan.json", JSON.stringify(toDelete, null, 0));
  console.log(`\nPlano salvo em scripts/dedup-plan.json (${toDelete.length} exclusões).`);

  if (APPLY && toDelete.length) {
    console.log(`\nAPLICANDO ${toDelete.length} exclusões...`);
    const ids = toDelete.map((d) => d.id);
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      await sql`DELETE FROM products WHERE id = ANY(${chunk})`;
    }
    console.log("OK, exclusões aplicadas.");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
