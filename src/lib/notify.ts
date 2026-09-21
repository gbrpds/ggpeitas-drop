/** Notificação de nova venda para o dono, via ntfy.sh (push no celular). */

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function notifyNewSale(o: {
  number: string | null;
  totalCents: number;
  customerName?: string;
  itemsCount?: number;
  url?: string;
}): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return; // não configurado → ignora
  try {
    // valor em ASCII puro (o header Title do ntfy não aceita acentos/espaço especial)
    const valorAscii = `R$ ${(o.totalCents / 100).toFixed(2).replace(".", ",")}`;
    const headers: Record<string, string> = {
      Title: `Nova venda: ${valorAscii}`,
      Priority: "high",
      Tags: "moneybag,shirt",
    };
    if (o.url) headers.Click = o.url;
    const linhas = [
      `Pedido #${o.number ?? ""} - ${brl(o.totalCents)}`,
      o.customerName ? `Cliente: ${o.customerName}` : "",
      o.itemsCount ? `${o.itemsCount} item(ns)` : "",
    ].filter(Boolean);
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers,
      body: linhas.join("\n"),
    });
  } catch (e) {
    console.error("ntfy notify error", e);
  }
}

/** Notificação de novo pedido GERADO (antes do pagamento) para o dono. */
export async function notifyNewOrder(o: {
  number: string | null;
  totalCents: number;
  customerName?: string;
  method?: string;
  url?: string;
}): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    const valorAscii = `R$ ${(o.totalCents / 100).toFixed(2).replace(".", ",")}`;
    const headers: Record<string, string> = {
      Title: `Novo pedido: ${valorAscii}`,
      Priority: "default",
      Tags: "receipt,hourglass",
    };
    if (o.url) headers.Click = o.url;
    const linhas = [
      `Pedido #${o.number ?? ""} - ${brl(o.totalCents)} (aguardando pagamento)`,
      o.customerName ? `Cliente: ${o.customerName}` : "",
      o.method ? `Forma: ${o.method}` : "",
    ].filter(Boolean);
    await fetch(`https://ntfy.sh/${topic}`, { method: "POST", headers, body: linhas.join("\n") });
  } catch (e) {
    console.error("ntfy new order error", e);
  }
}

/** Notificação de nova conta criada no site. */
export async function notifyNewAccount(a: { name?: string | null; email?: string | null; provider?: string }): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    const headers: Record<string, string> = {
      Title: "Nova conta criada",
      Priority: "default",
      Tags: "wave,bust_in_silhouette",
    };
    const linhas = [
      a.name ? `Nome: ${a.name}` : "",
      a.email ? `E-mail: ${a.email}` : "",
      a.provider ? `Via: ${a.provider}` : "",
    ].filter(Boolean);
    await fetch(`https://ntfy.sh/${topic}`, { method: "POST", headers, body: linhas.join("\n") || "Novo cadastro" });
  } catch (e) {
    console.error("ntfy new account error", e);
  }
}

/** Notificação de uma nova solicitação de camisa (cliente não achou na busca). */
export async function notifyProductRequest(r: {
  contact: string;
  description: string;
  query?: string | null;
  name?: string | null;
  imageUrl?: string | null;
}): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    const headers: Record<string, string> = {
      Title: "Nova solicitacao de camisa",
      Priority: "high",
      Tags: "mag,shirt",
    };
    if (r.imageUrl) headers.Attach = r.imageUrl;
    const linhas = [
      r.name ? `Cliente: ${r.name}` : "",
      `Contato: ${r.contact}`,
      r.query ? `Buscou: ${r.query}` : "",
      `Pedido: ${r.description}`,
      r.imageUrl ? `Foto: ${r.imageUrl}` : "",
    ].filter(Boolean);
    await fetch(`https://ntfy.sh/${topic}`, { method: "POST", headers, body: linhas.join("\n") });
  } catch (e) {
    console.error("ntfy request error", e);
  }
}
