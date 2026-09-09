import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getOwnedOrder, getOrderByToken } from "@/lib/order";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu feedback — GG Peitas" };

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  const order = (await getOwnedOrder(id)) ?? (token ? await getOrderByToken(id, token) : null);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="auth-wrap wrap" style={{ maxWidth: 560 }}>
          {!order ? (
            <div className="cart-empty">
              <MessageSquare strokeWidth={1.5} />
              <h2>Link inválido</h2>
              <p>Não encontramos este pedido. Use o link enviado no seu e-mail de entrega.</p>
              <Link className="btn btn-g" href="/">Ir para a loja</Link>
            </div>
          ) : (
            <>
              <h1 className="page-title">Conte como foi</h1>
              <p className="auth-lead">
                Seu pedido <b>#{order.number}</b> chegou! Sua opinião ajuda a gente a melhorar sempre.
              </p>
              <FeedbackForm orderId={id} token={token ?? null} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
