import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

type MapRow = { idx: number; id: string; name: string; price: number };
type R = { id: string; name: string; images: string[] | null; source_id: string | null; created_at: string; price_cents: number };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const APPLY = process.argv.includes("--apply");
const THRESH = 10;

const LONG_IDX = new Set<number>([
  4,8,12,15, 33,36,38,41,45,48, 51,52,56,58,69,73, 79,81, 107,117,120,122,123,
  128,130,132,134,135,137,139,148, 153,155,156,159, 182,185,194, 201,209,217,
  229,231,232,234,236,246, 256,258,266,271, 280,283,289,295, 323,324,
  333,338,339,340,345, 350,351,355,358,359,360,364,367,369,373,374,
  379,382,384,387,389,394,395, 409,415,417,420, 429,430, 450,454,471, 477, 571,
  575,578,579,582,589,590,592, 600,601,605,607,608,612,614,617,618,621,622,
  625,631,632,633,635,638,642,643,648, 650,653,655,658,660,663,665,671, 680,691,
]);

function toMangaLonga(name: string): string {
  if (/\(manga longa\)/i.test(name)) return name;
  if (/ - /.test(name)) return name.replace(/ - /, " (Manga Longa) - ");
  return name.replace(/ \((Masculino|Feminino)\)\s*$/i, " (Manga Longa) ($1)");
}
async function aHash(url: string | undefined): Promise<bigint | null> {
  if (!url) return null;
  try {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const raw = await sharp(buf).greyscale().resize(8, 8, { fit: "fill" }).raw().toBuffer();
    let sum = 0; for (const v of raw) sum += v; const avg = sum / raw.length;
    let h = 0n; for (let i = 0; i < 64; i++) h = (h << 1n) | (raw[i] >= avg ? 1n : 0n); return h;
  } catch { return null; }
}
const ham = (a: bigint, b: bigint) => { let x = a ^ b, c = 0; while (x) { c += Number(x & 1n); x >>= 1n; } return c; };
const better = (a: R, b: R) => (a.source_id ? 1 : 0) - (b.source_id ? 1 : 0) || ((a.images?.length ?? 0) - (b.images?.length ?? 0)) || (+new Date(a.created_at) - +new Date(b.created_at));

async function main() {
  const map = JSON.parse(fs.readFileSync("scripts/groups-tiles/map.json", "utf8")) as MapRow[];
  const longIds = new Set(map.filter((m) => LONG_IDX.has(m.idx)).map((m) => m.id));

  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,images,source_id,created_at,price_cents FROM products WHERE active=true`) as R[];
  const activeNames = new Set(rows.map((r) => r.name.toLowerCase()));
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  const renames: { id: string; from: string; to: string }[] = [];
  const deletes: { id: string; name: string; why: string }[] = [];

  for (const g of groups) {
    const hs = await Promise.all(g.map(async (r) => ({ r, h: await aHash(r.images?.[0]) })));
    const used = new Array(hs.length).fill(false);
    const clusters: R[][] = [];
    for (let i = 0; i < hs.length; i++) {
      if (used[i]) continue; const cl = [hs[i].r]; used[i] = true;
      for (let j = i + 1; j < hs.length; j++) {
        if (used[j]) continue;
        if (hs[i].h != null && hs[j].h != null && ham(hs[i].h!, hs[j].h!) <= THRESH) { cl.push(hs[j].r); used[j] = true; }
      }
      clusters.push(cl);
    }
    for (const cl of clusters) {
      const shorts = cl.filter((m) => !longIds.has(m.id)).sort(better);
      const longs = cl.filter((m) => longIds.has(m.id)).sort(better);
      shorts.pop(); // curta sobrevivente
      for (const s of shorts) deletes.push({ id: s.id, name: s.name, why: "cópia curta" });
      const longKeep = longs.pop();
      for (const l of longs) deletes.push({ id: l.id, name: l.name, why: "cópia longa" });
      if (longKeep) {
        const to = toMangaLonga(longKeep.name);
        if (activeNames.has(to.toLowerCase()) && to.toLowerCase() !== longKeep.name.toLowerCase())
          deletes.push({ id: longKeep.id, name: longKeep.name, why: "manga longa já existe" });
        else { renames.push({ id: longKeep.id, from: longKeep.name, to }); activeNames.add(to.toLowerCase()); }
      }
    }
  }

  console.log(`RENAMES -> Manga Longa (+229,90): ${renames.length}`);
  console.log(`DELETES (cópia real mesma manga): ${deletes.length}`);
  fs.writeFileSync("scripts/final-groups-plan.json", JSON.stringify({ renames, deletes }, null, 0));
  console.log("Plano salvo em scripts/final-groups-plan.json");

  const RENAMES_ONLY = process.argv.includes("--renames-only");
  if (APPLY || RENAMES_ONLY) {
    for (const r of renames) await sql`UPDATE products SET name=${r.to}, price_cents=22990 WHERE id=${r.id}`;
    console.log(`RENAMES aplicados: ${renames.length}`);
    if (!RENAMES_ONLY) {
      const ids = deletes.map((d) => d.id);
      for (let i = 0; i < ids.length; i += 100) await sql`DELETE FROM products WHERE id = ANY(${ids.slice(i, i + 100)})`;
      console.log(`DELETES aplicados: ${ids.length}`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
