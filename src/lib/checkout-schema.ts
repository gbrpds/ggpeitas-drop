import { z } from "zod";

// O cliente só informa QUAL produto e quanto — o preço é resolvido no servidor.
export const itemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive().max(20),
  size: z.string().max(8).optional(),
  version: z.string().max(40).optional(),
  customName: z.string().trim().max(20).optional(),
  customNumber: z.string().trim().max(3).optional(),
});

export const customerSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  cpf: z.string().min(11, "CPF inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(8, "Telefone inválido"),
});

export const shippingSchema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(1),
  numero: z.string().min(1, "Informe o número"),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  uf: z.string().min(2),
});

export type CheckoutCustomer = z.infer<typeof customerSchema>;
export type CheckoutShipping = z.infer<typeof shippingSchema>;
