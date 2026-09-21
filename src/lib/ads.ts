/** Google Ads — ID e rótulo da conversão de compra.
 *  Valores públicos (aparecem no client), então podem ficar no código.
 *  Dá pra sobrescrever por env (NEXT_PUBLIC_*) se um dia mudar de conta. */
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "AW-18465265776";
export const GADS_PURCHASE_LABEL =
  process.env.NEXT_PUBLIC_GADS_PURCHASE_LABEL || "hmVCCOem6v8cEPCw9uRE";
