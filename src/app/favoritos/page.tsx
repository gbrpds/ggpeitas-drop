import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Star } from "lucide-react";
import { getDb } from "@/db";
import { favorites } from "@/db/schema";
import { resolveUserId } from "@/lib/order";
import { getAllActive } from "@/lib/catalog";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meus favoritos", robots: { index: false } };

export default async function FavoritosPage() {
  const uid = await resolveUserId();

  let products: Awaited<ReturnType<typeof getAllActive>> = [];
  if (uid) {
    try {
      const rows = await getDb()
        .select({ productId: favorites.productId })
        .from(favorites)
        .where(eq(favorites.userId, uid))
        .orderBy(desc(favorites.createdAt));
      const ids = rows.map((r) => r.productId);
      const order = new Map(ids.map((id, i) => [id, i]));
      const all = await getAllActive();
      products = all
        .filter((p) => order.has(p.id))
        .sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
    } catch {
      /* sem banco */
    }
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap search-page">
          <h1 className="search-title">
            Meus favoritos
            {uid && <span>{products.length} {products.length === 1 ? "item" : "itens"}</span>}
          </h1>

          {!uid ? (
            <div className="cart-empty">
              <Star strokeWidth={1.5} />
              <h2>Entre para ver seus favoritos</h2>
              <p>Salve as camisas que você mais gosta e encontre todas aqui.</p>
              <Link className="btn btn-g" href="/conta">Entrar / Cadastrar</Link>
            </div>
          ) : products.length === 0 ? (
            <div className="cart-empty">
              <Star strokeWidth={1.5} />
              <h2>Nenhum favorito ainda</h2>
              <p>Toque na estrela ⭐ de qualquer camisa para salvá-la aqui.</p>
              <Link className="btn btn-g" href="/">Ver a loja</Link>
            </div>
          ) : (
            <div className="cat-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
