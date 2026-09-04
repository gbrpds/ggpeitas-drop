import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

/** IP do cliente a partir dos headers (Vercel/Proxy). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? "unknown").trim() || "unknown";
}

/**
 * Rate limiting de janela fixa, atômico (um único UPSERT), usando o Neon.
 * Retorna ok=false quando o limite foi excedido na janela.
 * Fail-OPEN: se o limiter falhar, não derruba a loja (só loga) — é proteção
 * de disponibilidade, não uma decisão de autorização.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; count: number }> {
  try {
    const rows = (await getSql()`
      insert into rate_limits (key, count, window_start)
      values (${key}, 1, now())
      on conflict (key) do update set
        count = case
          when rate_limits.window_start < now() - (${windowSec} * interval '1 second')
          then 1 else rate_limits.count + 1 end,
        window_start = case
          when rate_limits.window_start < now() - (${windowSec} * interval '1 second')
          then now() else rate_limits.window_start end
      returning count
    `) as { count: number }[];
    const count = Number(rows[0]?.count ?? 1);
    return { ok: count <= limit, count };
  } catch (e) {
    console.error("rate limit error", e);
    return { ok: true, count: 0 };
  }
}

/** Resposta 429 padrão. */
export function tooMany(msg = "Muitas tentativas. Tente novamente em instantes.") {
  return Response.json({ error: msg }, { status: 429 });
}
