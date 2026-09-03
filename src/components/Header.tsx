"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, User, ShoppingCart, Package, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";

export function Header() {
  const openDrawer = useUI((s) => s.openDrawer);
  const openCart = useUI((s) => s.openCart);
  const items = useCart((s) => s.items);
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0];
  const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
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
              {mounted && isAdmin && (
                <Link href="/admin">
                  <LayoutDashboard strokeWidth={1.8} /> Painel Admin
                </Link>
              )}
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
          <button className="act cartbtn" onClick={openCart}>
            <ShoppingCart strokeWidth={1.8} />
            <span className="lbl">
              <small>Carrinho</small>
              <b>{brl(total)}</b>
            </span>
            {count > 0 && <span className="cnt">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
