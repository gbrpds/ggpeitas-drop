import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Diagnóstico (admin): mostra quais variáveis de ambiente chegaram ao servidor. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  }
  return NextResponse.json({
    blobTokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
    databaseUrlPresent: !!process.env.DATABASE_URL,
    adminEmailsPresent: !!process.env.ADMIN_EMAILS,
    mpTokenPresent: !!process.env.MP_ACCESS_TOKEN,
  });
}
