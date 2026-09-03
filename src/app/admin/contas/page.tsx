import Link from "next/link";
import { desc } from "drizzle-orm";
import { Lock, Users, MessageCircle } from "lucide-react";
import { getDb } from "@/db";
import { users, orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { waLink } from "@/lib/whatsapp";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Contas — GG Peitas" };

export default async function AdminContasPage() {
  const ok = await isAdmin();

  let rows: { id: string; name: string | null; email: string; phone: string | null; createdAt: Date }[] = [];
  if (ok) {
    const db = getDb();
    const [uList, oList] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
    ]);
    // telefone: pega do pedido mais recente de cada usuário
    const phoneByUser = new Map<string, string>();
    for (const o of oList) {
      if (o.userId && !phoneByUser.has(o.userId)) {
        const c = o.customer as { phone?: string };
        if (c?.phone) phoneByUser.set(o.userId, c.phone);
      }
    }
    rows = uList.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: phoneByUser.get(u.id) ?? null,
      createdAt: u.createdAt,
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
            <div className="cart-empty"><Lock strokeWidth={1.5} /><h2>Acesso restrito</h2><Link className="btn btn-g" href="/conta">Entrar</Link></div>
          ) : (
            <>
              <AdminNav />
              <h1 className="page-title">Contas ({rows.length})</h1>
              {rows.length === 0 ? (
                <div className="cart-empty"><Users strokeWidth={1.5} /><h2>Nenhuma conta cadastrada</h2></div>
              ) : (
                <div className="adm-accounts">
                  {rows.map((u) => (
                    <div className="adm-account" key={u.id}>
                      <div className="adm-account-info">
                        <b>{u.name ?? "—"}</b>
                        <span>{u.email}</span>
                        <span className="adm-account-phone">{u.phone ?? "sem telefone"}</span>
                      </div>
                      <span className="adm-account-date">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      {u.phone ? (
                        <a className="wa-btn" href={waLink(u.phone)} target="_blank" rel="noopener">
                          <MessageCircle size={15} /> WhatsApp
                        </a>
                      ) : (
                        <span className="wa-btn disabled">—</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
