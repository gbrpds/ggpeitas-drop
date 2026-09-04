import { pgTable, text, timestamp, uuid, integer, jsonb, boolean } from "drizzle-orm/pg-core";

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
  number: text("number").unique(), // identificador amigável único: AAAAMM0001
  userId: uuid("user_id"), // nulo = compra como visitante
  status: text("status").default("pending").notNull(), // pending | approved | cancelled | rejected
  paymentMethod: text("payment_method").notNull(), // pix | card
  totalCents: integer("total_cents").notNull(), // total líquido (já com desconto)
  discountCents: integer("discount_cents").notNull().default(0), // desconto Leve 3 Pague 2
  items: jsonb("items").notNull(),
  customer: jsonb("customer").notNull(), // { name, cpf, email, phone }
  shipping: jsonb("shipping").notNull(), // { cep, rua, numero, bairro, cidade, uf }
  mpPaymentId: text("mp_payment_id"),
  trackingCode: text("tracking_code"), // código de rastreio dos Correios
  shippingStatus: text("shipping_status"), // preparando | enviado | entregue
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

/** Catálogo de produtos cadastrados pelo admin. */
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  team: text("team"),
  category: text("category").notNull(), // futebol | selecoes | feminina | infantil | player | retro | brasileirao | europa
  priceCents: integer("price_cents").notNull(),
  compareCents: integer("compare_cents"), // preço "de" (riscado), opcional
  version: text("version"), // torcedor | jogador (opcional)
  images: jsonb("images").notNull().default([]), // string[] de URLs (Vercel Blob)
  active: boolean("active").notNull().default(true), // aparece na loja
  inStock: boolean("in_stock").notNull().default(true), // dropshipping: disponível p/ compra
  promo3x2: boolean("promo3x2").notNull().default(false), // participa do "Leve 3, Pague 2"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

/** Inscrições "avise-me quando voltar" (produto sem estoque). */
export const stockNotifications = pgTable("stock_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull(),
  email: text("email").notNull(),
  notified: boolean("notified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StockNotificationRow = typeof stockNotifications.$inferSelect;

/** Escudos oficiais dos times (upload pelo admin, exibidos no modal de time). */
export const teamCrests = pgTable("team_crests", {
  name: text("name").primaryKey(),
  crestUrl: text("crest_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Times do modal "time de coração" (gerenciados no admin). */
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  colors: jsonb("colors").notNull().default(["#0f8a3d", "#ffc400", "#ffffff"]),
  crestUrl: text("crest_url"),
  sort: integer("sort").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TeamRow = typeof teams.$inferSelect;

/** Avaliações de produtos (1 por usuário por produto). */
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: text("product_id").notNull(), // id do catálogo (uuid do DB ou id do mock)
  userId: uuid("user_id"), // quem avaliou (nulo = legado)
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(), // 1..5
  comment: text("comment"),
  verified: boolean("verified").notNull().default(false), // comprou o produto
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReviewRow = typeof reviews.$inferSelect;
export type NewReviewRow = typeof reviews.$inferInsert;

/** Contadores de rate limiting (janela fixa por chave). */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).defaultNow().notNull(),
});
