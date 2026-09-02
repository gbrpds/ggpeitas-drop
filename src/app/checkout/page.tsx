import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = { title: "Checkout — GG Peitas" };

export default function CheckoutPage() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <h1 className="page-title">Finalizar compra</h1>
          <CheckoutClient />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
