import Link from "next/link";
import { notFound } from "next/navigation";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductBanner } from "@/components/product/ProductBanner";
import { Description } from "@/components/product/Description";
import { getCatalogProduct } from "@/lib/catalog";
import { metaFor } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getCatalogProduct(id);
  if (!product) notFound();

  const cat = metaFor(product.category);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />

      <main>
        <div className="pdp wrap">
          <nav className="crumbs" aria-label="Caminho">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <Link href={cat.href}>{cat.title}</Link>
            <span className="sep">/</span>
            <span>{product.name}</span>
          </nav>

          <div className="pdp-grid">
            <Gallery product={product} />
            <BuyBox product={product} />
          </div>
        </div>

        <ProductBanner />
        <Description product={product} />
      </main>

      <FooterTrust />
      <SiteFooter />
      <WhatsAppFloat />
      <MobileDrawer />
    </>
  );
}
