import type { Metadata } from "next";
import { Anton, Archivo, Inter } from "next/font/google";
import "./globals.css";
import { JerseySymbol } from "@/components/Jersey";
import { Providers } from "@/components/Providers";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { IdleLogout } from "@/components/IdleLogout";

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

export const metadata: Metadata = {
  title: "GG Peitas — Camisas de Futebol",
  description:
    "Camisas de clubes e seleções do mundo todo. Frete grátis, até 12x sem juros e envio para todo o Brasil.",
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
        </Providers>
      </body>
    </html>
  );
}
