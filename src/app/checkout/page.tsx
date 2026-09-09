import { resolveUserId } from "@/lib/order";
import { getProfile } from "@/lib/account";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — GG Peitas" };

export default async function CheckoutPage() {
  // compra permitida com conta OU como visitante (dados informados no checkout)
  const userId = await resolveUserId();
  const profile = userId ? await getProfile(userId) : null;

  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <div className="wrap checkout-wrap">
          <h1 className="page-title">Finalizar compra</h1>
          <CheckoutClient
            isLoggedIn={!!userId}
            savedProfile={
              profile
                ? { cpf: profile.cpf, phone: profile.phone, address: profile.address }
                : null
            }
          />
        </div>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
