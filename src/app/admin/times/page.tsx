import Link from "next/link";
import { Lock } from "lucide-react";
import { getDb } from "@/db";
import { teamCrests } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTeamCrests } from "@/components/admin/AdminTeamCrests";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Times — GG Peitas" };

export default async function AdminTimesPage() {
  const ok = await isAdmin();
  let initial: Record<string, string> = {};
  if (ok) {
    try {
      const db = getDb();
      const rows = await db.select().from(teamCrests);
      for (const r of rows) initial[r.name] = r.crestUrl;
    } catch {
      initial = {};
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
              <h1 className="page-title">Escudos dos times</h1>
              <AdminTeamCrests initial={initial} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
