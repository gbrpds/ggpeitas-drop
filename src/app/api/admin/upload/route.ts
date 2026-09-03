import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Upload de imagem de produto para o Vercel Blob (retorna a URL pública). */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie um arquivo de imagem." }, { status: 400 });
  }

  try {
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const blob = await put(`produtos/${Date.now()}-${safe}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("blob upload error", e);
    return NextResponse.json(
      { error: "Falha no upload. Verifique se o Vercel Blob está configurado (BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }
}
