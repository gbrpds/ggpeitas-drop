import Link from "next/link";
import { desc } from "drizzle-orm";
import { Lock, ShoppingBag } from "lucide-react";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { brl } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Pedidos — GG Peitas" };

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Em aberto", cls: "st-pending" },
  approved: { label: "Pago", cls: "st-approved" },
  cancelled: { label: "Cancelado", cls: "st-cancelled" },
  rejected: { label: "Cancelado", cls: "st-cancelled" },
};

type Item = { name: string; qty: number };
type Customer = { name?: string; email?: string; phone?: string };

export default async function AdminPedidosPage() {
  const ok = await isAdmin();
  let list: (typeof orders.$inferSelect)[] = [];
  if (ok) {
    const db = getDb();
    list = await db.select().from(orders).orderBy(desc(orders.createdAt));
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
              <h1 className="page-title">Pedidos ({list.length})</h1>
              {list.length === 0 ? (
                <div className="cart-empty"><ShoppingBag strokeWidth={1.5} /><h2>Nenhum pedido ainda</h2></div>
              ) : (
                <div className="orders-list">
                  {list.map((o) => {
                    const st = STATUS[o.status] ?? STATUS.pending;
                    const items = (o.items as Item[]) ?? [];
                    const c = (o.customer as Customer) ?? {};
                    const qty = items.reduce((s, i) => s + i.qty, 0);
                    const date = new Date(o.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    return (
                      <div className="order-card" key={o.id}>
                        <div className="order-head">
                          <div>
                            <b className="order-num">#{o.number ?? "—"}</b>
                            <span className="order-date">{date}</span>
                          </div>
                          <span className={`order-status ${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="order-body">
                          <span className="order-items">
                            <b>{c.name ?? "—"}</b> · {c.email ?? ""} · {qty} {qty === 1 ? "item" : "itens"}: {items.map((i) => i.name).join(", ")}
                          </span>
                          <b className="order-total">{brl(o.totalCents / 100)}</b>
                        </div>
                        <div className="order-foot">
                          <span className="order-pay">{o.paymentMethod === "pix" ? "PIX" : "Cartão"}</span>
                          {c.phone && (
                            <a className="wa-btn" href={waLink(c.phone)} target="_blank" rel="noopener">WhatsApp</a>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
