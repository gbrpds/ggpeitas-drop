export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Preço da parcela em 10x (sem juros). */
export const parcela = (n: number, x = 10) => brl(n / x);

/** Percentual de desconto arredondado. */
export const desconto = (now: number, was?: number) =>
  was ? Math.round((1 - now / was) * 100) : 0;
