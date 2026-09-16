import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";

/** Upload de imagem de produto para o Vercel Blob (via servidor). */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  }

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }
  // allowlist explícita — bloqueia SVG (XSS) e outros tipos
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG, WEBP ou GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 5 MB)." }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage(buf, file.name);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("r2 upload error", e); // detalhe fica só no log do servidor
    return NextResponse.json({ error: "Falha no upload da imagem." }, { status: 500 });
  }
}
