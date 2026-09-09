import Link from "next/link";
import { notFound } from "next/navigation";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductBanner } from "@/components/product/ProductBanner";
import { Description } from "@/components/product/Description";
import { TrustBadges } from "@/components/TrustBadges";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { getCatalogProduct } from "@/lib/catalog";
import { metaFor } from "@/lib/catalog";
import { getProductReviews } from "@/lib/reviews";
import { resolveUserId } from "@/lib/order";
import { getGenderInfo } from "@/lib/variant";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getCatalogProduct(id);
  if (!product) notFound();

  const cat = metaFor(product.category);
  const uid = await resolveUserId();
  const { list, summary } = await getProductReviews(id, uid);
  const gender = await getGenderInfo(product);

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
            <BuyBox product={product} summary={summary} gender={gender} />
          </div>
        </div>

        <TrustBadges />
        <ProductBanner />
        <Description product={product} />
        <ProductReviews productId={id} productName={product.name} summary={summary} list={list} />
      </main>

      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
