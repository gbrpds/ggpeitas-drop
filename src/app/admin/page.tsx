import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, Lock } from "lucide-react";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — GG Peitas" };

export default async function AdminPage() {
  const ok = await isAdmin();

  let rows: { id: string; name: string; category: string; priceCents: number; active: boolean; inStock: boolean; promo3x2: boolean; images: string[] }[] = [];
  if (ok) {
    const db = getDb();
    const data = await db.select().from(products).orderBy(desc(products.createdAt));
    rows = data.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      active: p.active,
      inStock: p.inStock,
      promo3x2: p.promo3x2,
      images: (p.images as string[]) ?? [],
    }));
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          {!ok ? (
            <div className="cart-empty">
              <Lock strokeWidth={1.5} />
              <h2>Acesso restrito</h2>
              <p>Esta área é exclusiva da equipe GG Peitas.</p>
              <Link className="btn btn-g" href="/conta">Entrar</Link>
            </div>
          ) : (
            <>
              <AdminNav />
              <div className="adm-head">
                <h1 className="page-title" style={{ margin: 0 }}>Produtos</h1>
                <Link className="btn btn-g" href="/admin/novo"><Plus size={18} /> Novo produto</Link>
              </div>
              <AdminProducts rows={rows} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
