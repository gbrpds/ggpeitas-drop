"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, X, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { brl } from "@/lib/format";
import { Jersey } from "@/components/Jersey";
import { promoDiscountFromItems, PROMO_TITLE } from "@/lib/promo";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const clearCart = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // trava o scroll do body quando aberto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const list = mounted ? items : [];
  const count = list.reduce((n, i) => n + i.qty, 0);
  const subtotal = list.reduce((s, i) => s + i.price * i.qty, 0);
  const discount =
    promoDiscountFromItems(
      list.map((i) => ({ priceCents: Math.round(i.price * 100), qty: i.qty, promo: !!i.promo })),
    ) / 100;
  const total = subtotal - discount;
  const FRETE_MIN = 299;

  return (
    <>
      <div className={`cd-scrim${open ? " open" : ""}`} onClick={close} />
      <aside className={`cartdrawer${open ? " open" : ""}`} aria-label="Carrinho" aria-hidden={!open}>
        <div className="cd-head">
          <div className="cd-title">
            <ShoppingBag size={20} strokeWidth={2} /> Carrinho
            {count > 0 && <span className="cd-count">{count}</span>}
          </div>
          <div className="cd-head-actions">
            {list.length > 0 && (
              <button className="cd-clear" onClick={clearCart}>
                <Trash2 size={15} /> Esvaziar
              </button>
            )}
            <button className="cd-close" onClick={close} aria-label="Fechar">
              <X size={22} />
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="cd-empty">
            <ShoppingBag strokeWidth={1.4} />
            <h3>Seu carrinho está vazio</h3>
            <p>Escolha a camisa do seu time e volte aqui.</p>
            <Link className="btn btn-g" href="/" onClick={close}>Ver produtos</Link>
          </div>
        ) : (
          <>
            <div className="cd-body">
              {total < FRETE_MIN ? (
                <div className="cd-freight">
                  <Truck size={16} /> Faltam <b>{brl(FRETE_MIN - total)}</b> para o <b>frete grátis</b>
                </div>
              ) : (
                <div className="cd-freight ok">
                  <Truck size={16} /> Você ganhou <b>frete grátis!</b>
                </div>
              )}

              {list.map((i) => (
                <div className="cd-item" key={i.id}>
                  <div className="cd-item-media">
                    {i.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt={i.name} />
                    ) : (
                      <Jersey colors={i.colors} />
                    )}
                  </div>
                  <div className="cd-item-main">
                    <div className="cd-item-top">
                      <span className="cd-item-name">{i.name}</span>
                      <button className="cd-item-remove" onClick={() => removeItem(i.id)} aria-label="Remover">
                        <X size={16} />
                      </button>
                    </div>
                    {(i.size || i.version) && (
                      <span className="cd-item-var">{[i.size, i.version].filter(Boolean).join(" · ")}</span>
                    )}
                    <div className="cd-item-bottom">
                      <div className="cd-qtybox">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Diminuir"><Minus size={14} /></button>
                        <span>{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Aumentar"><Plus size={14} /></button>
                      </div>
                      <b className="cd-item-price">{brl(i.price * i.qty)}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-foot">
              <div className="cd-line"><span>Subtotal</span><b>{brl(subtotal)}</b></div>
              {discount > 0 && (
                <div className="cd-line cd-promo"><span>{PROMO_TITLE}</span><b>− {brl(discount)}</b></div>
              )}
              <div className="cd-line">
                <span>Frete</span>
                {total >= FRETE_MIN ? <b className="free">Grátis</b> : <b>a calcular</b>}
              </div>
              <div className="cd-total"><span>Total</span><b>{brl(total)}</b></div>
              <p className="cd-parc">ou em até 3x de {brl(total / 3)} sem juros</p>
              <Link className="cd-checkout" href="/checkout" onClick={close}>
                Finalizar compra <ArrowRight size={18} strokeWidth={2.4} />
              </Link>
              <button className="cd-continue" onClick={close}>Continuar comprando</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
