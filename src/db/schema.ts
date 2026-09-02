import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
