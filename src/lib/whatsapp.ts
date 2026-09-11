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

type OrderItem = {
  productId?: string;
  name: string;
  qty: number;
  size?: string;
  version?: string;
  customName?: string;
  customNumber?: string;
};
type Address = { cep?: string; rua?: string; numero?: string; bairro?: string; cidade?: string; uf?: string };
type Customer = { name?: string };

/** Nome base da camisa (sem o sufixo de tamanho/versão/personalização). */
function baseName(i: OrderItem): string {
  let n = i.name;
  const sv = [i.size, i.version].filter(Boolean).join(" · ");
  if (sv) n = n.replace(` (${sv})`, "");
  n = n.split(" — Personalizada:")[0].split(" — Com patrocínios")[0].split(" + Patrocínios")[0];
  return n.trim();
}

/**
 * Mensagem clara para o fornecedor (dropshipping direto ao cliente).
 * Inclui tamanho, personalização, dados de envio e o link da foto de cada item.
 */
export function supplierOrderMessage(
  order: {
    number?: string | null;
    items?: OrderItem[];
    customer?: Customer;
    shipping?: Address;
  },
  imageOf?: (productId?: string) => string | undefined,
): string {
  const c = order.customer ?? {};
  const s = order.shipping ?? {};
  const linhas: string[] = [`Pedido #${order.number ?? ""}`, "", "Itens:"];

  for (const i of order.items ?? []) {
    let l = `* ${baseName(i)} / Tamanho: ${i.size || "-"}`;
    if (i.customName?.trim() || i.customNumber?.trim()) {
      l += ` / Personalização: (Name: ${i.customName?.trim() || "-"}) (Number: ${i.customNumber?.trim() || "-"})`;
    }
    if (i.qty > 1) l += ` / Qtd: ${i.qty}`;
    linhas.push(l);
    const img = imageOf?.(i.productId);
    if (img) linhas.push(`  Foto: ${img}`);
  }

  linhas.push(
    "",
    "Dados de envio:",
    c.name ?? "",
    `${s.rua ?? ""}, ${s.numero ?? ""} - ${s.bairro ?? ""}`,
    `${s.cidade ?? ""}/${s.uf ?? ""}`,
    `CEP ${s.cep ?? ""}`,
  );
  return linhas.join("\n");
}
