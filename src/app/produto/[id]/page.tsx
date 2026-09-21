import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { baseUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/JsonLd";
import { teamSlug } from "@/lib/team-slug";
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
import { SizeChart } from "@/components/product/SizeChart";
import { genderOf } from "@/lib/facets";
import { TrustBadges } from "@/components/TrustBadges";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { getCatalogProduct, getRelatedProducts } from "@/lib/catalog";
import { metaFor } from "@/lib/catalog";
import { ProductCarousel } from "@/components/ProductCarousel";
import { getProductReviews } from "@/lib/reviews";
import { resolveUserId } from "@/lib/order";
import { getGenderInfo } from "@/lib/variant";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getCatalogProduct(id);
  if (!p) return { title: "Produto não encontrado" };
  const title = p.name;
  const description = `${p.name} — camisa importada premium (qualidade tailandesa 1:1)${p.team ? `, ${p.team}` : ""}. A partir de R$ ${p.now.toFixed(2).replace(".", ",")}, frete grátis acima de R$299 e até 3x sem juros.`.slice(0, 165);
  const img = p.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `/produto/${id}` },
    openGraph: { title, description, type: "website", url: `${baseUrl()}/produto/${id}`, images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: img ? [img] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getCatalogProduct(id);
  if (!product) notFound();

  const cat = metaFor(product.category);
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: `${product.name} — camisa importada premium (qualidade tailandesa 1:1).`,
    brand: { "@type": "Brand", name: product.team || "GG Peitas" },
    category: cat.title,
    offers: {
      "@type": "Offer",
      url: `${baseUrl()}/produto/${product.id}`,
      priceCurrency: "BRL",
      price: product.now.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.rating && product.rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.avg.toFixed(1), reviewCount: product.rating.count } }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: baseUrl() },
      { "@type": "ListItem", position: 2, name: cat.title, item: `${baseUrl()}${cat.href}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${baseUrl()}/produto/${product.id}` },
    ],
  };
  const uid = await resolveUserId();
  const { list, summary } = await getProductReviews(id, uid);
  const gender = await getGenderInfo(product);
  const related = await getRelatedProducts(product.id, product.team, product.category);
  const relatedHref = product.team ? `/time/${teamSlug(product.team)}` : cat.href;

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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
        <SizeChart defaultGender={genderOf(product.name) === "feminina" ? "feminino" : "masculino"} />
        {related.length > 0 && (
          <ProductCarousel
            section={{ id: "related", title: "Você também pode gostar", emoji: "", href: relatedHref, products: related }}
          />
        )}
        <ProductReviews productId={id} productName={product.name} summary={summary} list={list} />
      </main>

      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
