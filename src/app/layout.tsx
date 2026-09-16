import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Inter } from "next/font/google";
import "./globals.css";
import { JerseySymbol } from "@/components/Jersey";
import { Providers } from "@/components/Providers";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { TeamModal } from "@/components/TeamModal";
import { TeamFloat } from "@/components/TeamFloat";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PromoToast } from "@/components/PromoToast";
import { JsonLd } from "@/components/JsonLd";

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
  "Camisas de futebol importadas premium (qualidade tailandesa 1:1) — clubes e seleções do mundo todo, retrô e versões atuais. Frete grátis acima de R$299, até 3x sem juros e envio para todo o Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GG Peitas — Camisas de Futebol Importadas Premium",
    template: "%s · GG Peitas",
  },
  description: DESC,
  keywords: [
    "camisas de futebol",
    "camisas importadas",
    "camisas tailandesas",
    "camisa tailandesa 1:1",
    "camisa de time importada",
    "camisa retrô",
    "camisas de seleções",
    "camisa de futebol barata",
    "loja de camisas de futebol",
    "GG Peitas",
  ],
  applicationName: "GG Peitas",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
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
    title: "GG Peitas — Camisas de Futebol Importadas Premium",
    description: DESC,
    // a imagem (fundo preto + logo) vem de app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "GG Peitas — Camisas de Futebol Importadas Premium",
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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "GG Peitas",
  description: DESC,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/opengraph-image`,
  priceRange: "R$ 129 - R$ 299",
  areaServed: "BR",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/busca?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${archivo.variable} ${anton.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={orgJsonLd} />
        <JerseySymbol />
        <Providers>
          {children}
          <CartDrawer />
          <TeamModal />
          <TeamFloat />
          <RevealOnScroll />
          <PromoToast />
        </Providers>
      </body>
    </html>
  );
}
