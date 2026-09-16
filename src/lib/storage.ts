import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * Armazenamento de imagens no Cloudflare R2 (S3-compatível). Egress grátis e
 * bem mais barato que o Blob para uma loja com muita foto.
 *
 * Env vars (na Vercel e no .env.local):
 *   R2_ACCOUNT_ID         — id da conta Cloudflare (aparece na URL do painel)
 *   R2_ACCESS_KEY_ID      — Access Key do token R2 (S3)
 *   R2_SECRET_ACCESS_KEY  — Secret do token R2 (S3)
 *   R2_BUCKET             — nome do bucket (ex.: ggpeitas)
 *   R2_PUBLIC_BASE        — URL pública do bucket (r2.dev ou domínio próprio)
 */
export function storageConfigured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE
  );
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

const publicBase = () => process.env.R2_PUBLIC_BASE!.replace(/\/$/, "");

/** URL pública de uma chave no bucket. */
export function publicUrl(key: string): string {
  return `${publicBase()}/${key}`;
}

/**
 * Otimiza uma imagem: redimensiona para no máximo `maxW` de largura e
 * reencoda como JPEG de qualidade `quality`. Reduz muito storage/transfer.
 * Se algo falhar (formato estranho), devolve o buffer original.
 */
export async function optimizeImage(
  input: Buffer,
  { maxW = 1000, quality = 80 }: { maxW?: number; quality?: number } = {},
): Promise<{ body: Buffer; contentType: string; ext: string }> {
  try {
    const body = await sharp(input)
      .rotate() // respeita orientação EXIF
      .resize({ width: maxW, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    return { body, contentType: "image/jpeg", ext: "jpg" };
  } catch {
    return { body: input, contentType: "image/jpeg", ext: "jpg" };
  }
}

/** Sobe um buffer para o R2 e devolve a URL pública. */
export async function uploadBuffer(key: string, body: Buffer, contentType: string): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrl(key);
}

/** Otimiza e sobe uma imagem de produto; retorna a URL pública no R2. */
export async function uploadProductImage(input: Buffer, baseName: string): Promise<string> {
  const { body, contentType, ext } = await optimizeImage(input);
  const rand = Math.random().toString(36).slice(2, 10);
  const safe = baseName.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/\.[a-z0-9]+$/i, "");
  const key = `produtos/${safe}-${rand}.${ext}`;
  return uploadBuffer(key, body, contentType);
}
