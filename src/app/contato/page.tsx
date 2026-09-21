import Link from "next/link";
import type { Metadata } from "next";
import { AtSign, Mail, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/contact";
import { Announce } from "@/components/Announce";
import { Header } from "@/components/Header";
import { MainNav } from "@/components/MainNav";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a GG Peitas: WhatsApp, Instagram, e-mail e solicitação de camisas. Estamos aqui para ajudar você a vestir o manto do seu time.",
  alternates: { canonical: "/contato" },
};

export default function Contato() {
  return (
    <>
      <Announce />
      <Header />
      <MainNav />
      <main>
        <article className="wrap blog-article">
          <h1>Contato</h1>
          <div className="blog-body">
            <p>Ficou com alguma dúvida ou quer falar com a gente? Escolha o canal que preferir, respondemos o mais rápido possível.</p>
          </div>
          <div className="contato-list">
            <a className="contato-card" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Phone size={22} /> <div><b>WhatsApp</b><span>Fale com a gente direto</span></div>
            </a>
            <a className="contato-card" href="https://www.instagram.com/ggpeitas/" target="_blank" rel="noopener noreferrer">
              <AtSign size={22} /> <div><b>Instagram</b><span>@ggpeitas</span></div>
            </a>
            <a className="contato-card" href="mailto:ggpeitas@gmail.com">
              <Mail size={22} /> <div><b>E-mail</b><span>ggpeitas@gmail.com</span></div>
            </a>
            <Link className="contato-card" href="/solicitar">
              <MessageCircle size={22} /> <div><b>Solicitar uma camisa</b><span>Não achou o modelo? A gente busca</span></div>
            </Link>
            <Link className="contato-card" href="/rastrear">
              <ShoppingBag size={22} /> <div><b>Rastrear pedido</b><span>Acompanhe sua compra</span></div>
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <MobileDrawer />
    </>
  );
}
