import Link from "next/link";
import { Tag, Check } from "lucide-react";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ProductCard } from "@/components/ProductCard";
import { getPromoProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Leve 3, Pague 2 — GG Peitas",
  description: "Monte o kit da família: a cada 3 camisas participantes, a mais barata sai grátis.",
};

export default async function PromocaoPage() {
  const products = await getPromoProducts();

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <section className="promo-hero wrap">
          <span className="promo-hero-eb"><Tag size={14} /> Oferta relâmpago</span>
          <h1>Leve 3, Pague 2</h1>
          <p>
            A cada <b>3 camisas participantes</b> no carrinho, a <b>mais barata sai grátis</b> —
            o desconto é aplicado automaticamente. Monte o kit da família e economize de verdade. 💚
          </p>
          <div className="promo-hero-steps">
            <span><Check size={15} /> Junte 3 (ou 6, 9…) camisas da promoção</span>
            <span><Check size={15} /> O desconto aparece sozinho no carrinho</span>
            <span><Check size={15} /> Frete grátis acima de R$ 299</span>
          </div>
        </section>

        <section className="wrap" style={{ paddingBottom: 32 }}>
          {products.length === 0 ? (
            <div className="cart-empty">
              <Tag strokeWidth={1.5} />
              <h2>Nenhuma camisa na promoção agora</h2>
              <p>Volte em breve — estamos preparando os kits!</p>
              <Link className="btn btn-g" href="/">Ver a loja</Link>
            </div>
          ) : (
            <div className="cat-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <MobileDrawer />
    </>
  );
}
