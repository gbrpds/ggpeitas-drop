import fs from "node:fs";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
import { neon } from "@neondatabase/serverless";
type R = { id: string; name: string; category: string };
const norm = (s: string) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id,name,category FROM products WHERE active=true`) as R[];
  const byName = new Map<string, R[]>();
  for (const r of rows) { const k = norm(r.name); (byName.get(k) ?? byName.set(k, []).get(k)!).push(r); }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  const cats = {
    retroSemAno: [] as string[],   // "Retrô - Modelo" (sem ano)
    edicao: [] as string[],        // Edição genérica (Especial/Preta/Branca/...)
    comAnoModelo: [] as string[],  // ano + modelo padrão (Home/Away/Third/Goleiro/Pré-Jogo)
    outros: [] as string[],
  };
  const editionRe = /edição\s+(especial|preta|branca|azul|verde|roxa|cinza|joint|originals|terrace|co-branded|comemorativa|anivers|aniversário|campeão)/i;
  let totalExcedente = 0;
  for (const g of groups) {
    const n = g[0].name; const x = g.length; totalExcedente += x - 1;
    if (/retr[ôo]\s+-\s/i.test(n)) cats.retroSemAno.push(`${n} ×${x}`);
    else if (editionRe.test(n)) cats.edicao.push(`${n} ×${x}`);
    else if (/ - (home|away|third away|goleiro|pré-jogo|pre-jogo)\b/i.test(n)) cats.comAnoModelo.push(`${n} ×${x}`);
    else cats.outros.push(`${n} ×${x}`);
  }
  console.log(`Grupos: ${groups.length} | excedentes (produtos além de 1 por nome): ${totalExcedente}`);
  const dump = (label: string, arr: string[]) => { console.log(`\n### ${label}: ${arr.length} grupos`); arr.sort().forEach((s) => console.log("   " + s)); };
  dump("A) RETRÔ SEM ANO (precisa identificar ano por foto)", cats.retroSemAno);
  dump("B) EDIÇÃO genérica (precisa identificar a edição por foto)", cats.edicao);
  dump("C) ANO+MODELO padrão (prováveis quase-dups que o hash ≤6 não pegou)", cats.comAnoModelo);
  dump("D) OUTROS", cats.outros);
}
main().catch((e) => { console.error(e); process.exit(1); });
