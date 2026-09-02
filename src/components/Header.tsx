"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, User, ShoppingCart } from "lucide-react";
import { Crest } from "./Crest";
import { ThemeToggle } from "./ThemeToggle";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";

export function Header() {
  const openDrawer = useUI((s) => s.openDrawer);
  const items = useCart((s) => s.items);
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
          <Crest />
          <span>
            <b>GG PEITAS</b>
            <small>CAMISAS PREMIUM</small>
          </span>
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
          <Link className="act hide-sm" href="/conta">
            <User strokeWidth={1.8} />
            <span className="lbl">
              <small>Entrar</small>
              <b>Minha conta</b>
            </span>
          </Link>
          <Link className="act cartbtn" href="/carrinho">
            <ShoppingCart strokeWidth={1.8} />
            <span className="lbl">
              <small>Carrinho</small>
              <b>{brl(total)}</b>
            </span>
            {count > 0 && <span className="cnt">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
