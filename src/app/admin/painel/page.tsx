import Link from "next/link";
import { desc } from "drizzle-orm";
import { Lock, TrendingUp, Megaphone } from "lucide-react";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { brl } from "@/lib/format";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel — GG Peitas" };

const STATUS_PT: Record<string, { label: string; cls: string }> = {
  approved: { label: "Pago", cls: "ok" },
  pending: { label: "Pendente", cls: "pend" },
  cancelled: { label: "Cancelado", cls: "bad" },
  rejected: { label: "Recusado", cls: "bad" },
};
const PAY_PT: Record<string, string> = { pix: "PIX", card: "Cartão", boleto: "Boleto" };

export default async function PainelPage() {
  const ok = await isAdmin();
  if (!ok) {
    return (
      <>
        <Announce /><Header /><MainNav />
        <main><div className="wrap checkout-wrap">
          <div className="cart-empty"><Lock strokeWidth={1.5} /><h2>Acesso restrito</h2>
            <Link className="btn btn-g" href="/conta">Entrar</Link></div>
        </div></main>
        <SiteFooter /><MobileDrawer />
      </>
    );
  }

  const db = getDb();
  const rows = await db
    .select({
      id: orders.id, number: orders.number, status: orders.status, totalCents: orders.totalCents,
      paymentMethod: orders.paymentMethod, gclid: orders.gclid, customer: orders.customer, createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const now = Date.now();
  const DAY = 86400000;
  const paid = rows.filter((r) => r.status === "approved");
  const inLast = (r: (typeof rows)[number], days: number) => now - +new Date(r.createdAt) <= days * DAY;
  const soma = (list: typeof rows) => list.reduce((a, r) => a + r.totalCents, 0);

  const hoje = paid.filter((r) => inLast(r, 1));
  const d7 = paid.filter((r) => inLast(r, 7));
  const d30 = paid.filter((r) => inLast(r, 30));
  const ads30 = d30.filter((r) => !!r.gclid);
  const ticket = d30.length ? soma(d30) / d30.length : 0;

  const Card = ({ titulo, n, valor, icon, hint }: { titulo: string; n: number; valor: number; icon?: React.ReactNode; hint?: string }) => (
    <div className="pnl-card">
      <span className="pnl-card-top">{icon}{titulo}</span>
      <b className="pnl-card-num">{n} {n === 1 ? "venda" : "vendas"}</b>
      <span className="pnl-card-val">{brl(valor / 100)}</span>
      {hint ? <span className="pnl-card-hint">{hint}</span> : null}
    </div>
  );

  const nome = (c: unknown) => (c && typeof c === "object" && "name" in c ? String((c as { name?: string }).name ?? "") : "");

  return (
    <>
      <Announce /><Header /><MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <AdminNav />
          <div className="adm-head">
            <h1 className="page-title" style={{ margin: 0 }}>Painel de vendas</h1>
          </div>
          <p className="cat-intro" style={{ margin: "0 0 18px" }}>
            Resumo simples das suas vendas (as "conversões"). <strong>Origem "Google Ads"</strong> = o cliente
            chegou por um anúncio; <strong>"Direto/Orgânico"</strong> = veio por conta própria (busca, Instagram, link).
          </p>

          <div className="pnl-cards">
            <Card titulo="Hoje" n={hoje.length} valor={soma(hoje)} />
            <Card titulo="Últimos 7 dias" n={d7.length} valor={soma(d7)} icon={<TrendingUp size={15} />} />
            <Card titulo="Últimos 30 dias" n={d30.length} valor={soma(d30)} icon={<TrendingUp size={15} />} />
            <Card titulo="Vindas do Google Ads (30d)" n={ads30.length} valor={soma(ads30)} icon={<Megaphone size={15} />} hint="pedidos que chegaram por anúncio" />
            <div className="pnl-card">
              <span className="pnl-card-top">Ticket médio (30d)</span>
              <b className="pnl-card-num">{brl(ticket / 100)}</b>
              <span className="pnl-card-hint">valor médio por venda</span>
            </div>
          </div>

          <h2 className="pnl-h2">Últimos pedidos</h2>
          {rows.length === 0 ? (
            <div className="cart-empty"><h2>Ainda sem pedidos</h2></div>
          ) : (
            <div className="pnl-tablewrap">
              <table className="pnl-table">
                <thead>
                  <tr><th>Data</th><th>Pedido</th><th>Cliente</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Origem</th></tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r) => {
                    const st = STATUS_PT[r.status] ?? { label: r.status, cls: "pend" };
                    return (
                      <tr key={r.id}>
                        <td>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td><Link href={`/admin/pedidos`} className="pnl-link">#{r.number}</Link></td>
                        <td>{nome(r.customer) || "—"}</td>
                        <td className="pnl-val">{brl(r.totalCents / 100)}</td>
                        <td>{PAY_PT[r.paymentMethod] ?? r.paymentMethod}</td>
                        <td><span className={`pnl-badge ${st.cls}`}>{st.label}</span></td>
                        <td>{r.gclid ? <span className="pnl-badge ads">Google Ads</span> : <span className="pnl-origem">Direto/Orgânico</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <SiteFooter /><MobileDrawer />
    </>
  );
}
