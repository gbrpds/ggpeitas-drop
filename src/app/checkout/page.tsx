import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — GG Peitas" };

export default async function CheckoutPage() {
  // compra exige conta: visitante vai para login e volta pro checkout
  let logged = false;
  try {
    const session = await auth();
    logged = !!session?.user;
  } catch {
    logged = false;
  }
  if (!logged) redirect("/conta?next=/checkout");

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
