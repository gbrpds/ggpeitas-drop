"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { Jersey } from "@/components/Jersey";

/**
 * Galeria de fotos do produto. Enquanto não há fotos reais (virão do Yupoo via
 * admin/Neon), mostra o mockup da camisa como placeholder em vários "ângulos".
 */
export function Gallery({ product }: { product: Product }) {
  // 4 slots de foto (placeholder). No futuro: product.images.
  const views = [0, 1, 2, 3];
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="main">
        <Jersey colors={product.colors} />
        <span className="gtag">Espaço para fotos reais · foto {active + 1} de {views.length}</span>
      </div>
      <div className="thumbs">
        {views.map((v) => (
          <button
            key={v}
            className={`thumb${active === v ? " active" : ""}`}
            onClick={() => setActive(v)}
            aria-label={`Ver foto ${v + 1}`}
          >
            <Jersey colors={product.colors} />
          </button>
        ))}
      </div>
    </div>
  );
}
