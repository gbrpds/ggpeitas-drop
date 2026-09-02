import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { Banner } from "@/components/Banner";
import { TrustStrip } from "@/components/TrustStrip";
import { CategoryCircles } from "@/components/CategoryCircles";
import { ProductCarousel } from "@/components/ProductCarousel";
import { PromoBanner } from "@/components/PromoBanner";
import { FooterTrust } from "@/components/FooterTrust";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MobileDrawer } from "@/components/MobileDrawer";
import { sections } from "@/data/products";

export default function Home() {
  const [vendidos, ...rest] = sections;

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <Banner />
      <TrustStrip />
      <CategoryCircles />

      {/* Mais vendidos primeiro, depois a promo, depois o restante */}
      <ProductCarousel section={vendidos} />
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
