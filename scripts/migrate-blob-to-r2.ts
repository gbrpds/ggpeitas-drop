/**
 * Migra as fotos dos produtos do Vercel Blob para o Cloudflare R2.
 * - baixa cada imagem (URLs do Blob são públicas), otimiza e sobe no R2
 * - atualiza a coluna `images` de cada produto com as novas URLs
 * - idempotente: pula o que já está no R2; mantém a URL antiga se algo falhar
 *
 * Rodar:  node_modules/.bin/tsx scripts/migrate-blob-to-r2.ts
 * Precisa no .env.local: DATABASE_URL + R2_ACCOUNT_ID/ACCESS_KEY_ID/
 * SECRET_ACCESS_KEY/BUCKET/PUBLIC_BASE
 */
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

// carrega .env.local em process.env (tsx não faz isso sozinho)
for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const { uploadProductImage, storageConfigured } = await import("../src/lib/storage");

const isR2 = (url: string) => {
  const base = (process.env.R2_PUBLIC_BASE ?? "").replace(/\/$/, "");
  return !!base && url.startsWith(base);
};

async function main() {
  if (!storageConfigured()) {
    console.error("R2 não configurado. Falta alguma env var R2_* no .env.local.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT id, name, images FROM products`) as {
    id: string;
    name: string;
    images: string[] | null;
  }[];

  let migrated = 0,
    skipped = 0,
    failed = 0,
    changedProducts = 0;

  for (const r of rows) {
    const imgs = Array.isArray(r.images) ? r.images : [];
    if (!imgs.length) continue;
    const next: string[] = [];
    let changed = false;
    for (const url of imgs) {
      if (isR2(url)) {
        next.push(url);
        skipped++;
        continue;
      }
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        const newUrl = await uploadProductImage(buf, r.name || "produto");
        next.push(newUrl);
        changed = true;
        migrated++;
      } catch (e) {
        console.warn("  falhou:", url, (e as Error).message);
        next.push(url); // mantém a antiga como fallback
        failed++;
      }
    }
    if (changed) {
      await sql`UPDATE products SET images = ${JSON.stringify(next)}::jsonb WHERE id = ${r.id}`;
      changedProducts++;
      process.stdout.write(".");
    }
  }
  console.log(
    `\nOK — produtos atualizados: ${changedProducts} | fotos migradas: ${migrated} | já no R2: ${skipped} | falhas: ${failed}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
