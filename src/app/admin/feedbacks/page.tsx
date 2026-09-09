import Link from "next/link";
import { desc } from "drizzle-orm";
import { Lock, MessageSquare } from "lucide-react";
import { getDb } from "@/db";
import { feedbacks } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { Stars } from "@/components/reviews/Stars";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Feedbacks — GG Peitas" };

export default async function AdminFeedbacksPage() {
  const ok = await isAdmin();
  let list: (typeof feedbacks.$inferSelect)[] = [];
  if (ok) {
    const db = getDb();
    list = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
  }

  const count = list.length;
  const avg = count ? list.reduce((s, f) => s + f.rating, 0) / count : 0;

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
              <h1 className="page-title">Feedbacks ({count})</h1>
              {count > 0 && (
                <div className="ordf-summary">
                  Média: <b>{avg.toFixed(1)}</b> de 5 · {count} {count === 1 ? "avaliação" : "avaliações"}
                </div>
              )}
              {count === 0 ? (
                <div className="cart-empty">
                  <MessageSquare strokeWidth={1.5} />
                  <h2>Nenhum feedback ainda</h2>
                  <p>Os feedbacks aparecem aqui quando os clientes respondem após a entrega.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {list.map((f) => {
                    const date = new Date(f.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    return (
                      <div className="order-card" key={f.id}>
                        <div className="order-head">
                          <div>
                            <b className="order-num">{f.customerName ?? "Cliente"}</b>
                            <span className="order-date">{date}</span>
                          </div>
                          <Stars value={f.rating} size={15} />
                        </div>
                        {f.comment && <p className="fb-comment">{f.comment}</p>}
                        <div className="order-foot">
                          <span className="order-pay">
                            {f.orderNumber ? `Pedido #${f.orderNumber}` : "—"}
                          </span>
                          {f.customerEmail && <span className="fb-email">{f.customerEmail}</span>}
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
