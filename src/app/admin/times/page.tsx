import Link from "next/link";
import { asc } from "drizzle-orm";
import { Lock } from "lucide-react";
import { getDb } from "@/db";
import { teams } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import type { JerseyColors } from "@/data/products";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTeams } from "@/components/admin/AdminTeams";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Times — GG Peitas" };

export default async function AdminTimesPage() {
  const ok = await isAdmin();
  let initial: { id: string; name: string; colors: JerseyColors; crestUrl: string | null }[] = [];
  if (ok) {
    try {
      const db = getDb();
      const rows = await db.select().from(teams).orderBy(asc(teams.sort), asc(teams.name));
      initial = rows.map((r) => ({
        id: r.id,
        name: r.name,
        colors: r.colors as JerseyColors,
        crestUrl: r.crestUrl,
      }));
    } catch {
      initial = [];
    }
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
              <h1 className="page-title">Times &amp; escudos</h1>
              <AdminTeams initial={initial} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
