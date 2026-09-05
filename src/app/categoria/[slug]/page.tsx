import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCategoryProducts, metaFor } from "@/lib/catalog";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${metaFor(slug).title} — GG Peitas` };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = metaFor(slug);
  const items = await getCategoryProducts(slug);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <h1 className="sec-title" style={{ fontSize: "1.6rem" }}>
            {m.title}
          </h1>

          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag strokeWidth={1.5} />
              <h2>Em breve por aqui</h2>
              <p>Ainda não há produtos nesta categoria.</p>
              <Link className="btn btn-g" href="/">Voltar à loja</Link>
            </div>
          ) : (
            <div className="cat-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterTrust />
      <SiteFooter />
      <WhatsAppFloat />
      <MobileDrawer />
    </>
  );
}
