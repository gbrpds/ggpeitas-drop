"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { Product } from "@/data/products";
import { brl, parcela, desconto } from "@/lib/format";
import { Jersey } from "./Jersey";

export function ProductCard({ product }: { product: Product }) {
  const off = desconto(product.now, product.was);

  return (
    <motion.article
      className="card"
      whileHover={{ y: -4, boxShadow: "0 16px 30px -14px rgba(0,0,0,.28)" }}
      transition={{ duration: 0.14 }}
    >
      <Link className="media" href={`/produto/${product.id}`} aria-label={product.name}>
        {product.isNew ? (
          <span className="new">NOVO</span>
        ) : (
          off > 0 && (
            <span className="off">
              <ArrowDown strokeWidth={2.5} />
              {off}%
            </span>
          )
        )}
        {product.images && product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="card-photo" src={product.images[0]} alt={product.name} />
        ) : (
          <Jersey colors={product.colors} />
        )}
      </Link>
      <div className="body">
        <div className="pr">
          <span className="now">{brl(product.now)}</span>
          {product.was && <span className="was">{brl(product.was)}</span>}
        </div>
        <Link className="name" href={`/produto/${product.id}`}>
          {product.name}
        </Link>
        <div className="parc">
          <b>3x</b> de <b>{parcela(product.now, 3)}</b> sem juros
        </div>
        <span className="frete">FRETE GRÁTIS</span>
        <Link className="btn add" href={`/produto/${product.id}`}>
          Comprar agora
        </Link>
      </div>
    </motion.article>
  );
}
