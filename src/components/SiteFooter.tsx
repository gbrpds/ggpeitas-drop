import Link from "next/link";
import { MessageCircle, Music2 } from "lucide-react";
import { Logo } from "./Logo";

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

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="wrap foot">
        <div>
          <Link className="fbrand" href="/">
            <Logo />
          </Link>
          <p className="about">
            Futebol, estilo e presença. As melhores camisas de clubes e seleções do mundo, com entrega para todo o
            Brasil.
          </p>
          <div className="socials">
            <a href="https://www.instagram.com/ggpeitas/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da GG Peitas">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="WhatsApp">
              <MessageCircle strokeWidth={1.8} />
            </a>
            <a href="#" aria-label="TikTok">
              <Music2 strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div>
          <h4>Institucional</h4>
          <ul>
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
        <span>© 2026 GG Peitas · CNPJ 00.000.000/0001-00 · Todos os direitos reservados</span>
        <span>Política de Privacidade · Termos de Uso</span>
      </div>
    </footer>
  );
}
