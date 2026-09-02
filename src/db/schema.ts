import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";

/** Usuários da loja (login por e-mail/senha ou Google). */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  // nulo para quem entra via Google (não tem senha local)
  passwordHash: text("password_hash"),
  image: text("image"),
  provider: text("provider").default("credentials").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/** Pedidos da loja. */
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number"), // identificador amigável: AAAAMM0001
  userId: uuid("user_id"), // nulo = compra como visitante
  status: text("status").default("pending").notNull(), // pending | approved | cancelled | rejected
  paymentMethod: text("payment_method").notNull(), // pix | card
  totalCents: integer("total_cents").notNull(),
  items: jsonb("items").notNull(),
  customer: jsonb("customer").notNull(), // { name, cpf, email, phone }
  shipping: jsonb("shipping").notNull(), // { cep, rua, numero, bairro, cidade, uf }
  mpPaymentId: text("mp_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
