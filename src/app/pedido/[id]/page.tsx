import Link from "next/link";
import { Package } from "lucide-react";
import { getDb } from "@/db";
import { getOwnedOrder, getOrderById, expireStaleOrders } from "@/lib/order";
import { syncPaymentStatus } from "@/lib/mp";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderView } from "@/components/order/OrderView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido — GG Peitas" };

type Item = { id: string; name: string; price: number; qty: number };

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_id?: string; status?: string }>;
}) {
  const { id } = await params;
  const { payment_id: paymentId } = await searchParams;

  // Retorno do Checkout Pro do Mercado Pago: sincroniza o status na hora,
  // sem esperar o webhook (que confirma em definitivo em segundo plano).
  let paidHere = false;
  if (paymentId) {
    try {
      const { externalReference } = await syncPaymentStatus(String(paymentId));
      // só libera se o pagamento realmente pertence a este pedido
      paidHere = externalReference === id;
    } catch {
      /* segue */
    }
  }

  try {
    await expireStaleOrders(getDb());
  } catch {
    /* segue */
  }
  // Dono logado vê sempre; quem pagou como visitante volta do MP com payment_id
  // válido, então liberamos a visualização desse pedido específico.
  const order = (await getOwnedOrder(id)) ?? (paidHere ? await getOrderById(id) : null);

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
