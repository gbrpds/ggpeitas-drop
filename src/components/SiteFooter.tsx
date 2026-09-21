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
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
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
