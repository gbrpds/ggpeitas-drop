import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { productRequests } from "@/db/schema";
import { uploadProductImage } from "@/lib/storage";
import { notifyProductRequest } from "@/lib/notify";
import { sendEmail } from "@/lib/email";
import { adminEmails } from "@/lib/admin-emails";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

export async function POST(req: Request) {
  // limite: 5 solicitações por hora por IP
  const rl = await rateLimit(`req:${clientIp(req)}`, 5, 3600);
  if (!rl.ok) {
    return NextResponse.json({ error: "Muitas solicitações. Tente novamente mais tarde." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 160);
  const query = String(form.get("query") ?? "").trim().slice(0, 200);
  const description = String(form.get("description") ?? "").trim().slice(0, 1000);

  if (!contact) return NextResponse.json({ error: "Informe um contato (WhatsApp ou e-mail)." }, { status: 400 });
  if (description.length < 3) return NextResponse.json({ error: "Descreva a camisa que procura." }, { status: 400 });

  // foto opcional
  let imageUrl: string | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Foto em formato inválido (use JPG, PNG ou WEBP)." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Foto muito grande (máx. 8 MB)." }, { status: 400 });
    }
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadProductImage(buf, "solicitacao");
    } catch (e) {
      console.error("request photo upload error", e); // não bloqueia o pedido
    }
  }

  try {
    const db = getDb();
    await db.insert(productRequests).values({
      name: name || null,
      contact,
      query: query || null,
      description,
      imageUrl,
    });
  } catch (e) {
    console.error("request insert error", e);
    return NextResponse.json({ error: "Não foi possível registrar. Tente novamente." }, { status: 500 });
  }

  // notifica o dono (push + e-mail). IMPORTANTE: aguardar antes de responder —
  // na Vercel a função congela após a resposta e mataria envios pendentes.
  const tasks: Promise<unknown>[] = [notifyProductRequest({ contact, description, query, name, imageUrl })];
  // destinatário do e-mail: STORE_EMAIL (dedicado, não dá acesso admin) ou, se
  // não configurado, cai nos e-mails do admin.
  const recipients = (process.env.STORE_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const admins = recipients.length ? recipients : adminEmails();
  if (admins.length) {
    const html = `
      <h2>Nova solicitação de camisa</h2>
      <p><b>Cliente:</b> ${esc(name || "—")}</p>
      <p><b>Contato:</b> ${esc(contact)}</p>
      ${query ? `<p><b>Buscou por:</b> ${esc(query)}</p>` : ""}
      <p><b>Pedido:</b><br>${esc(description).replace(/\n/g, "<br>")}</p>
      ${imageUrl ? `<p><b>Foto:</b><br><a href="${imageUrl}"><img src="${imageUrl}" style="max-width:360px;border-radius:10px"></a></p>` : ""}
    `;
    tasks.push(
      sendEmail({
        to: admins.join(","),
        subject: "GG Peitas — Nova solicitação de camisa",
        html,
        replyTo: contact.includes("@") ? contact : undefined,
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  const emailResult = admins.length ? results[1] : null;
  const emailOk =
    emailResult?.status === "fulfilled" && (emailResult.value as { ok?: boolean })?.ok === true;

  return NextResponse.json({ ok: true, emailOk, notifiedTo: admins });
}
