import Link from "next/link";
import { Logo } from "./Logo";
import { WHATSAPP_URL } from "@/lib/contact";

const pays = ["PIX", "VISA", "MASTER", "ELO", "BOLETO", "MERCADO PAGO"];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.2 4.79 1.2h.004c5.46 0 9.91-4.44 9.91-9.9 0-2.65-1.03-5.14-2.9-7.02A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.16 8.16 0 0 1 2.42 5.81c0 4.54-3.7 8.24-8.25 8.24-1.5 0-2.98-.4-4.27-1.17l-.31-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24zm-4.5 4.4c-.22 0-.57.08-.87.4-.3.33-1.15 1.12-1.15 2.73s1.18 3.17 1.34 3.39c.17.22 2.32 3.54 5.62 4.96.79.34 1.4.55 1.88.71.79.25 1.51.21 2.08.13.63-.1 1.95-.8 2.22-1.57.27-.77.27-1.43.19-1.57-.08-.13-.3-.21-.63-.37-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.63-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.5.14-.67.15-.15.33-.39.5-.58.16-.2.22-.34.33-.56.11-.22.06-.41-.03-.58-.08-.16-.74-1.79-1.02-2.45-.27-.63-.54-.55-.74-.56z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="wrap foot">
        <div>
          <Link className="fbrand" href="/">
            <Logo />
          </Link>
          <p className="about">
            A GG Peitas é sua loja de <b>camisas de futebol importadas</b> — qualidade premium (padrão
            tailandesa 1:1) de clubes e seleções do mundo todo, versões atuais e <b>retrô</b>, com entrega
            para todo o Brasil.
          </p>
          <div className="socials">
            <a href="https://www.instagram.com/ggpeitas/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da GG Peitas">
              <InstagramIcon />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da GG Peitas">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div>
          <h4>Institucional</h4>
          <ul>
            <li><Link href="/camisas-importadas">Camisas importadas</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/quem-somos">Quem somos</Link></li>
            <li><Link href="/contato">Contato</Link></li>
            <li><Link href="/faq">Perguntas frequentes</Link></li>
            <li><Link href="/trocas">Trocas e devoluções</Link></li>
          </ul>
        </div>

        <div>
          <h4>Minha conta</h4>
          <ul>
            <li><Link href="/conta">Entrar / Cadastrar</Link></li>
            <li><Link href="/pedidos">Meus pedidos</Link></li>
            <li><Link href="/rastrear">Rastrear pedido</Link></li>
            <li><Link href="/favoritos">Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h4>Pagamento &amp; Envio</h4>
          <p className="about" style={{ marginTop: 0 }}>
            Parcele em até 3x sem juros. Compra 100% segura.
          </p>
          <div className="pay">
            {pays.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap fbottom">
        <span>© 2026 GG Peitas · Todos os direitos reservados</span>
        <span>Política de Privacidade · Termos de Uso</span>
      </div>
    </footer>
  );
}
