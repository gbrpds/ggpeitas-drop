"use client";

import type { ProductSection } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { Carousel } from "./Carousel";

export function ProductCarousel({ section }: { section: ProductSection }) {
  return (
    <Carousel title={section.title} seeHref={section.href}>
      {section.products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Carousel>
  );
}
