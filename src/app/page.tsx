import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { Banner } from "@/components/Banner";
import { TrustStrip } from "@/components/TrustStrip";
import { ProductCarousel } from "@/components/ProductCarousel";
import { PromoBanner } from "@/components/PromoBanner";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MobileDrawer } from "@/components/MobileDrawer";
import { HomeTeamSection } from "@/components/HomeTeamSection";
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
      <Banner />
      <HomeTeamSection />
      <TrustStrip />

      {/* Primeira seção, depois a promo, depois o restante */}
      {first && <ProductCarousel section={first} />}
      <PromoBanner />
      {rest.map((section) => (
        <ProductCarousel key={section.id} section={section} />
      ))}

      <FooterTrust />
      <SiteFooter />
      <WhatsAppFloat />
      <MobileDrawer />
    </>
  );
}
