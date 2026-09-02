import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Cliente do banco (Neon + Drizzle), inicializado sob demanda.
 * Assim o build não quebra quando DATABASE_URL ainda não está definido.
 */
export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL não definido. Configure a connection string do Neon em .env.local (e na Vercel).",
      );
    }
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}
