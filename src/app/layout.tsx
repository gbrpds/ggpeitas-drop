import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Inter } from "next/font/google";
import "./globals.css";
import { JerseySymbol } from "@/components/Jersey";
import { Providers } from "@/components/Providers";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { IdleLogout } from "@/components/IdleLogout";
import { TeamModal } from "@/components/TeamModal";
import { TeamFloat } from "@/components/TeamFloat";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PromoToast } from "@/components/PromoToast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggpeitas.com.br";
const DESC =
  "Camisas de clubes e seleções do mundo todo. Frete grátis, até 3x sem juros e envio para todo o Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GG Peitas — Camisas de Futebol",
  description: DESC,
  icons: {
    icon: [
      { url: "/logo.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.ico",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "GG Peitas",
    title: "GG Peitas — Camisas de Futebol",
    description: DESC,
    // a imagem (fundo preto + logo) vem de app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "GG Peitas — Camisas de Futebol",
    description: DESC,
  },
};

// Viewport explícito — evita zoom estranho ao trocar de página no mobile.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Aplica o tema salvo antes da pintura, evitando "flash" de tema errado.
const themeScript = `(function(){try{var t=localStorage.getItem('gg-theme')||'light';var r=document.documentElement;r.classList.toggle('gg-dark',t==='dark');r.removeAttribute('data-theme');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${archivo.variable} ${anton.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JerseySymbol />
        <Providers>
          {children}
          <CartDrawer />
          <IdleLogout />
          <TeamModal />
          <TeamFloat />
          <RevealOnScroll />
          <PromoToast />
        </Providers>
      </body>
    </html>
  );
}
