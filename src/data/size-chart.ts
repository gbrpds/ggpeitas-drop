/**
 * Tabela de medidas (cm) das camisas. Largura = medida do peito no plano
 * (de uma axila à outra). Comprimento = do ombro à barra.
 * ⚠️ VALORES DE REFERÊNCIA — confirmar com a tabela real do fornecedor.
 */
export type SizeRow = { size: string; largura: number; comprimento: number };

export const sizeChartMasculino: SizeRow[] = [
  { size: "P", largura: 48, comprimento: 68 },
  { size: "M", largura: 50, comprimento: 71 },
  { size: "G", largura: 53, comprimento: 73 },
  { size: "GG", largura: 55, comprimento: 75 },
  { size: "XG", largura: 58, comprimento: 78 },
  { size: "2XG", largura: 60, comprimento: 80 },
];

export const sizeChartFeminino: SizeRow[] = [
  { size: "P", largura: 40, comprimento: 58 },
  { size: "M", largura: 42, comprimento: 60 },
  { size: "G", largura: 44, comprimento: 62 },
  { size: "GG", largura: 46, comprimento: 64 },
];
