import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { CartClient } from "@/components/cart/CartClient";

export const metadata = { title: "Carrinho — GG Peitas" };

export default function CarrinhoPage() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <h1 className="page-title">Meu carrinho</h1>
          <CartClient />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
