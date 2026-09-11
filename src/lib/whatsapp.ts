/** Monta o link do WhatsApp a partir de um telefone com DDD (adiciona 55 se faltar). */
export function waLink(phone?: string | null): string {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "#";
  if (d.length <= 11) d = "55" + d; // adiciona código do Brasil
  return `https://wa.me/${d}`;
}

/** Link do WhatsApp com uma mensagem já preenchida. */
export function waLinkMsg(phone: string | null | undefined, message: string): string {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "#";
  if (d.length <= 11) d = "55" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}

type OrderItem = { name: string; qty: number };
type Address = { cep?: string; rua?: string; numero?: string; bairro?: string; cidade?: string; uf?: string };
type Customer = { name?: string };

/** Mensagem pronta para enviar o pedido ao fornecedor (dropshipping direto ao cliente). */
export function supplierOrderMessage(order: {
  number?: string | null;
  items?: OrderItem[];
  customer?: Customer;
  shipping?: Address;
}): string {
  const items = (order.items ?? []).map((i) => `- ${i.name} x${i.qty}`).join("\n");
  const c = order.customer ?? {};
  const s = order.shipping ?? {};
  return [
    `GG Peitas - Pedido #${order.number ?? ""}`,
    "",
    "Itens:",
    items || "-",
    "",
    "Enviar para:",
    c.name ?? "",
    `${s.rua ?? ""}, ${s.numero ?? ""} - ${s.bairro ?? ""}`,
    `${s.cidade ?? ""}/${s.uf ?? ""} - CEP ${s.cep ?? ""}`,
  ].join("\n");
}
