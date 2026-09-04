import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, Lock } from "lucide-react";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar produto — GG Peitas" };

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await isAdmin();

  let row: typeof products.$inferSelect | undefined;
  if (ok) {
    try {
      const db = getDb();
      [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    } catch {
      row = undefined;
    }
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap" style={{ maxWidth: 720 }}>
          {!ok ? (
            <div className="cart-empty"><Lock strokeWidth={1.5} /><h2>Acesso restrito</h2><Link className="btn btn-g" href="/conta">Entrar</Link></div>
          ) : !row ? (
            <div className="cart-empty"><h2>Produto não encontrado</h2><Link className="btn btn-g" href="/admin">Voltar</Link></div>
          ) : (
            <>
              <Link className="adm-back" href="/admin"><ArrowLeft size={16} /> Voltar aos produtos</Link>
              <h1 className="page-title">Editar produto</h1>
              <AdminProductForm
                id={row.id}
                initial={{
                  name: row.name,
                  team: row.team,
                  category: row.category,
                  priceCents: row.priceCents,
                  compareCents: row.compareCents,
                  version: row.version,
                  images: (row.images as string[]) ?? [],
                  active: row.active,
                  inStock: row.inStock,
                  promo3x2: row.promo3x2,
                }}
              />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
