"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Product } from "@/data/products";
import { Jersey } from "@/components/Jersey";

export function Gallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const hasPhotos = images.length > 0;
  const slots = hasPhotos ? images : [0, 1, 2, 3];
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="main">
        {hasPhotos ? (
          <img src={images[active]} alt={product.name} />
        ) : (
          <>
            <Jersey colors={product.colors} />
            <span className="gtag">Espaço para fotos reais · foto {active + 1} de {slots.length}</span>
          </>
        )}
      </div>
      <div className="thumbs">
        {slots.map((s, i) => (
          <button
            key={i}
            className={`thumb${active === i ? " active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Ver foto ${i + 1}`}
          >
            {hasPhotos ? <img src={images[i]} alt="" /> : <Jersey colors={product.colors} />}
          </button>
        ))}
      </div>
    </div>
  );
}
