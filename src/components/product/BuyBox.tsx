"use client";

import { useState } from "react";
import { ArrowDown, ShoppingCart, Sparkles, Check } from "lucide-react";
import type { Product } from "@/data/products";
import { brl, parcela, desconto } from "@/lib/format";
import { SIZES, VERSIONS } from "@/lib/product";
import { useCart } from "@/store/cart";
import { Stars } from "@/components/reviews/Stars";
import type { ReviewSummary } from "@/lib/reviews";
import { CorreiosBox } from "./CorreiosBox";
import { PromoRibbon } from "./PromoRibbon";
import { ProvadorModal } from "./ProvadorModal";
import { StockNotify } from "./StockNotify";

export function BuyBox({ product, summary }: { product: Product; summary?: ReviewSummary }) {
  const addItem = useCart((s) => s.addItem);
  const [size, setSize] = useState<string>("M");
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [provOpen, setProvOpen] = useState(false);

  const off = desconto(product.now, product.was);
  const economia = product.was ? product.was - product.now : 0;
  const outOfStock = product.inStock === false;

  const add = () => {
    addItem(product, { size, version, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="buy">
      <h1 className="ptitle">{product.name}</h1>
      <div className="sold">
        {summary && summary.count > 0 ? (
          <a href="#avaliacoes" className="sold-rate">
            <Stars value={summary.avg} size={14} />
            <b>{summary.avg.toFixed(1)}</b>
            <span>({summary.count} {summary.count === 1 ? "avaliação" : "avaliações"})</span>
          </a>
        ) : (
          <a href="#avaliacoes" className="sold-rate sold-new">
            <Stars value={0} size={14} /> Seja o primeiro a avaliar
          </a>
        )}
      </div>

      <div className="priceblock">
        <span className="pnow">{brl(product.now)}</span>
        {product.was && <span className="pwas">{brl(product.was)}</span>}
        {off > 0 && (
          <span className="poff">
            <ArrowDown strokeWidth={2.5} />
            {off}%
          </span>
        )}
      </div>
      <div className="parc">
        Em até <b>3x de {parcela(product.now, 3)}</b> sem juros
      </div>
      {economia > 0 && <span className="economia">{brl(economia)} de desconto</span>}

      {outOfStock ? (
        <StockNotify productId={product.id} />
      ) : (
      <>
      {/* Tamanho */}
      <div className="opt">
        <div className="opt-label">
          Tamanho: <span>{size}</span>
        </div>
        <div className="sizes">
          {SIZES.map((s) => (
            <button
              key={s}
              className={`size${size === s ? " active" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Versão */}
      <div className="opt">
        <div className="opt-label">
          Versão: <span>{version}</span>
        </div>
        <div className="versions">
          {VERSIONS.map((v) => (
            <button
              key={v}
              className={`version${version === v ? " active" : ""}`}
              onClick={() => setVersion(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Quantidade */}
      <div className="qtyrow">
        <span className="qlabel">Quantidade</span>
        <div className="qtybox">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
          <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar">
            +
          </button>
        </div>
      </div>

      {/* Ações */}
      <div className="buy-actions">
        <button className="btn-provador" onClick={() => setProvOpen(true)}>
          <Sparkles strokeWidth={2} /> Provador virtual
        </button>
        <button className="btn-add-cart" onClick={add}>
          {added ? (
            <>
              <Check strokeWidth={2.5} /> Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart strokeWidth={2} /> Adicionar ao carrinho
            </>
          )}
        </button>
        {added && <div className="added-msg">Produto adicionado ao carrinho ✓</div>}
      </div>

      <CorreiosBox />
      <PromoRibbon />
      </>
      )}

      <ProvadorModal open={provOpen} onClose={() => setProvOpen(false)} onPick={(s) => setSize(s)} />
    </div>
  );
}
