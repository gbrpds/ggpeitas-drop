import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { Banner } from "@/components/Banner";
import { TrustStrip } from "@/components/TrustStrip";
import { ProductCarousel } from "@/components/ProductCarousel";
import { PromoBanner } from "@/components/PromoBanner";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileDrawer } from "@/components/MobileDrawer";
import { HomeInitial } from "@/components/HomeInitial";
import { CollectionsCarousel } from "@/components/CollectionsCarousel";
import { getHomeSections, getBestSellers } from "@/lib/catalog";

// ISR: a home é servida do cache (instantânea, sem esperar o banco) e revalida
// em 2ª mão a cada 5 min. Mudanças no admin já invalidam via revalidateTag("products").
export const revalidate = 300;

export default async function Home() {
  const sections = await getHomeSections();
  const first = sections[0];

  // vitrine "Mais vendidas" (topo). Se vazia (loja sem produtos), usa a 1ª seção.
  const best = await getBestSellers();
  const topSection =
    best.length > 0
      ? { id: "mais-vendidas", title: "Mais vendidas", emoji: "", href: "/busca", products: best }
      : (first ?? null);

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <Banner />

        {/* Abaixo do banner: "Mais vendidas" (ou o time do coração, se escolhido) */}
        <HomeInitial firstSection={topSection} />

        {/* Coleções por time (carrossel) logo abaixo da primeira seção */}
        <CollectionsCarousel />

        {/* A faixa de benefícios vem depois da primeira seção de produtos */}
        <TrustStrip />

        <PromoBanner />
        {sections.map((section) => (
          <ProductCarousel key={section.id} section={section} />
        ))}
      </main>

      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
