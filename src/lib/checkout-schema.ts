import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
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
