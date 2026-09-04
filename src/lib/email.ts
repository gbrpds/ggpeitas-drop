/**
 * Envio de e-mail via Resend (API REST — sem dependência extra).
 * Se RESEND_API_KEY não estiver definido, vira no-op (loga e segue),
 * para não quebrar cadastro/checkout enquanto a chave não é configurada.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "GG Peitas <onboarding@resend.dev>";
  if (!key) {
    console.log("[email] RESEND_API_KEY ausente — pulando envio:", opts.subject, "→", opts.to);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[email] falha Resend", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] erro ao enviar", e);
    return { ok: false };
  }
}
