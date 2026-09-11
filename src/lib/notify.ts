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
    const headers: Record<string, string> = {
      // headers do ntfy devem ser ASCII (título sem acentos)
      Title: "GG Peitas: nova venda!",
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
