import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { RastrearForm } from "@/components/RastrearForm";

export const metadata = { title: "Rastrear pedido — GG Peitas" };

export default function RastrearPage() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <RastrearForm />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
