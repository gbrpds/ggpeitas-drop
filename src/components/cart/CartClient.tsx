"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { Jersey } from "@/components/Jersey";

export function CartClient() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="cart-empty">Carregando…</div>;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag strokeWidth={1.5} />
        <h2>Seu carrinho está vazio</h2>
        <p>Que tal escolher a camisa do seu time?</p>
        <Link className="btn btn-g" href="/">
          Ver produtos
        </Link>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="cart-grid">
      <div className="cart-list">
        {items.map((i) => (
          <div className="cart-item" key={i.id}>
            <div className="ci-media">
              <Jersey colors={i.colors} />
            </div>
            <div className="ci-info">
              <b>{i.name}</b>
              <span className="ci-price">{brl(i.price)}</span>
            </div>
            <div className="ci-actions">
              <div className="qtybox">
                <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Diminuir">
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) => setQty(i.id, Math.max(1, Number(e.target.value) || 1))}
                />
                <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Aumentar">
                  <Plus size={15} />
                </button>
              </div>
              <span className="ci-subtotal">{brl(i.price * i.qty)}</span>
              <button className="ci-remove" onClick={() => removeItem(i.id)} aria-label="Remover">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <h3>Resumo</h3>
        <div className="cs-line">
          <span>Subtotal</span>
          <b>{brl(total)}</b>
        </div>
        <div className="cs-line">
          <span>Frete</span>
          <b className="free">Grátis</b>
        </div>
        <div className="cs-total">
          <span>Total</span>
          <b>{brl(total)}</b>
        </div>
        <p className="cs-parc">ou em até 3x de {brl(total / 3)} sem juros</p>
        <Link className="cs-checkout" href="/checkout">
          Finalizar compra <ArrowRight size={18} strokeWidth={2.4} />
        </Link>
        <Link className="cs-continue" href="/">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
