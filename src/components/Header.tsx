"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, User, ShoppingCart, Package, LogOut, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { Jersey } from "./Jersey";
import { ThemeToggle } from "./ThemeToggle";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";

export function Header() {
  const openDrawer = useUI((s) => s.openDrawer);
  const items = useCart((s) => s.items);
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((n, i) => n + i.qty, 0) : 0;
  const total = mounted ? items.reduce((s, i) => s + i.price * i.qty, 0) : 0;

  return (
    <header className="site">
      <div className="topbar">
        <button className="burger" aria-label="Abrir menu" onClick={openDrawer}>
          <Menu strokeWidth={2} />
        </button>

        <Link className="brand" href="/" aria-label="GG Peitas">
          <Logo />
        </Link>

        <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="O que você está procurando? Ex: Flamengo, Brasil, Retrô…"
            aria-label="Buscar"
          />
          <button type="submit" aria-label="Buscar">
            <Search strokeWidth={2} />
          </button>
        </form>

        <div className="acts">
          <ThemeToggle />
          <div className="acc">
            <Link className="act hide-sm" href="/conta">
              <User strokeWidth={1.8} />
              <span className="lbl">
                {mounted && firstName ? (
                  <>
                    <small>Olá,</small>
                    <b>{firstName}</b>
                  </>
                ) : (
                  <>
                    <small>Entrar</small>
                    <b>Minha conta</b>
                  </>
                )}
              </span>
            </Link>
            <div className="acc-drop">
              {mounted && firstName && (
                <>
                  <div className="greet">
                    Bem vindo <b>{firstName}</b>!
                  </div>
                  <div className="sep" />
                </>
              )}
              <Link href="/conta">
                <User strokeWidth={1.8} /> Minha conta
              </Link>
              <Link href="/pedidos">
                <Package strokeWidth={1.8} /> Meus pedidos
              </Link>
              {mounted && firstName && (
                <>
                  <div className="sep" />
                  <button onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut strokeWidth={1.8} /> Sair
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="cart-wrap">
            <Link className="act cartbtn" href="/carrinho">
              <ShoppingCart strokeWidth={1.8} />
              <span className="lbl">
                <small>Carrinho</small>
                <b>{brl(total)}</b>
              </span>
              {count > 0 && <span className="cnt">{count}</span>}
            </Link>
            <div className="cart-drop">
              {!mounted || items.length === 0 ? (
                <div className="cart-drop-empty">Seu carrinho está vazio</div>
              ) : (
                <>
                  <div className="cart-drop-list">
                    {items.map((i) => (
                      <div className="cd-item" key={i.id}>
                        <div className="cd-media">
                          <Jersey colors={i.colors} />
                        </div>
                        <div className="cd-info">
                          <span className="cd-name">{i.name}</span>
                          <span className="cd-qty">
                            {i.qty} × {brl(i.price)}
                          </span>
                        </div>
                        <span className="cd-price">{brl(i.price * i.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cart-drop-foot">
                    <div className="cart-drop-total">
                      <span>Total</span>
                      <b>{brl(total)}</b>
                    </div>
                    <Link className="cart-drop-btn" href="/carrinho">
                      Ir para o carrinho <ArrowRight size={16} strokeWidth={2.4} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
