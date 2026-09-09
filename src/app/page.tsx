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
import { getHomeSections } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sections = await getHomeSections();
  const [first, ...rest] = sections;

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <Banner />

        {/* Abaixo do banner: produtos (ou o time do coração, se escolhido) */}
        <HomeInitial firstSection={first ?? null} />

        {/* Coleções por time (carrossel) logo abaixo da primeira seção */}
        <CollectionsCarousel />

        {/* A faixa de benefícios vem depois da primeira seção de produtos */}
        <TrustStrip />

        <PromoBanner />
        {rest.map((section) => (
          <ProductCarousel key={section.id} section={section} />
        ))}
      </main>

      <FooterTrust />
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
