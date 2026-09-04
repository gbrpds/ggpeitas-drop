/** Link oficial de rastreamento dos Correios para um código de objeto. */
export function correiosLink(code: string): string {
  const c = code.trim().toUpperCase().replace(/\s/g, "");
  return `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(c)}`;
}

/** Etapas de envio exibidas ao cliente (após pagamento aprovado). */
export const SHIPPING_STAGES = [
  { key: "preparando", label: "Preparando" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
] as const;

export type ShippingStage = (typeof SHIPPING_STAGES)[number]["key"];
