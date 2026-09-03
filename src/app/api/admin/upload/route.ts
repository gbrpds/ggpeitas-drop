import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * Upload direto do navegador para o Vercel Blob (sem o limite de ~4,5 MB das
 * funções serverless). Esta rota só gera o token de upload — o arquivo vai
 * direto do cliente para o Blob.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await isAdmin())) throw new Error("Acesso restrito.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 15 * 1024 * 1024, // 15 MB
        };
      },
      onUploadCompleted: async () => {
        /* opcional: notificação via webhook (não necessário aqui) */
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    console.error("blob handleUpload error", e);
    return NextResponse.json({ error: (e as Error).message ?? "Falha no upload." }, { status: 400 });
  }
}
