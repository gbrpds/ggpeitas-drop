/** Monta o link do WhatsApp a partir de um telefone com DDD (adiciona 55 se faltar). */
export function waLink(phone?: string | null): string {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "#";
  if (d.length <= 11) d = "55" + d; // adiciona código do Brasil
  return `https://wa.me/${d}`;
}
