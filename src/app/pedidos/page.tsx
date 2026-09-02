import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { resolveUserId } from "@/lib/order";
import { brl } from "@/lib/format";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus pedidos — GG Peitas" };

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Em aberto", cls: "st-pending" },
  approved: { label: "Pago", cls: "st-approved" },
  cancelled: { label: "Cancelado", cls: "st-cancelled" },
  rejected: { label: "Cancelado", cls: "st-cancelled" },
};

type OrderItem = { id: string; name: string; price: number; qty: number };

export default async function PedidosPage() {
  let logged = false;
  let list: (typeof orders.$inferSelect)[] = [];
  try {
    const session = await auth();
    logged = !!session?.user;
    if (logged) {
      const uid = await resolveUserId();
      if (uid) {
        const db = getDb();
        list = await db.select().from(orders).where(eq(orders.userId, uid)).orderBy(desc(orders.createdAt));
      }
    }
  } catch {
    /* trata como deslogado */
  }

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <h1 className="page-title">Meus pedidos</h1>

          {!logged ? (
            <div className="cart-empty">
              <Package strokeWidth={1.5} />
              <h2>Entre para ver seus pedidos</h2>
              <p>Faça login para acompanhar suas compras.</p>
              <Link className="btn btn-g" href="/conta">Entrar</Link>
            </div>
          ) : list.length === 0 ? (
            <div className="cart-empty">
              <Package strokeWidth={1.5} />
              <h2>Você ainda não fez pedidos</h2>
              <Link className="btn btn-g" href="/">Ver produtos</Link>
            </div>
          ) : (
            <div className="orders-list">
              {list.map((o) => {
                const st = STATUS[o.status] ?? STATUS.pending;
                const items = (o.items as OrderItem[]) ?? [];
                const qty = items.reduce((s, i) => s + i.qty, 0);
                const date = new Date(o.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
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
                        {qty} {qty === 1 ? "item" : "itens"} ·{" "}
                        {items.map((i) => i.name).join(", ")}
                      </span>
                      <b className="order-total">{brl(o.totalCents / 100)}</b>
                    </div>
                    <div className="order-foot">
                      <span className="order-pay">
                        {o.paymentMethod === "pix" ? "PIX" : "Cartão de crédito"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
