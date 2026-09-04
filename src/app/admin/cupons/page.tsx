import Link from "next/link";
import { desc } from "drizzle-orm";
import { Lock } from "lucide-react";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminCoupons } from "@/components/admin/AdminCoupons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Cupons — GG Peitas" };

export default async function AdminCuponsPage() {
  const ok = await isAdmin();
  let list: (typeof coupons.$inferSelect)[] = [];
  if (ok) {
    const db = getDb();
    list = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          {!ok ? (
            <div className="cart-empty"><Lock strokeWidth={1.5} /><h2>Acesso restrito</h2><Link className="btn btn-g" href="/conta">Entrar</Link></div>
          ) : (
            <>
              <AdminNav />
              <h1 className="page-title">Cupons</h1>
              <AdminCoupons
                initial={list.map((c) => ({
                  id: c.id,
                  code: c.code,
                  type: c.type as "percent" | "fixed",
                  value: c.value,
                  minCents: c.minCents,
                  maxUses: c.maxUses,
                  expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
                  active: c.active,
                }))}
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
