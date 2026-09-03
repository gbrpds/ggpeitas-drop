import Link from "next/link";
import { Package } from "lucide-react";
import { getDb } from "@/db";
import { getOwnedOrder, expireStaleOrders } from "@/lib/order";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderView } from "@/components/order/OrderView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido — GG Peitas" };

type Item = { id: string; name: string; price: number; qty: number };

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await expireStaleOrders(getDb());
  } catch {
    /* segue */
  }
  const order = await getOwnedOrder(id);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          {!order ? (
            <div className="cart-empty">
              <Package strokeWidth={1.5} />
              <h2>Pedido não encontrado</h2>
              <p>Entre na sua conta para acessar seus pedidos.</p>
              <Link className="btn btn-g" href="/conta">Entrar</Link>
            </div>
          ) : (
            <OrderView
              order={{
                id: order.id,
                number: order.number,
                status: order.status,
                paymentMethod: order.paymentMethod,
                totalCents: order.totalCents,
                items: (order.items as Item[]) ?? [],
              }}
            />
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
