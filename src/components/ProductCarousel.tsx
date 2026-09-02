"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ProductSection } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({ section }: { section: ProductSection }) {
  return (
    <motion.section
      className="car-sec wrap"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35 }}
    >
      <div className="car-head">
        <h2>
          {section.emoji} {section.title}
        </h2>
        <Link className="see" href={section.href}>
          Ver tudo <ArrowRight strokeWidth={2.4} />
        </Link>
      </div>
      <div className="car">
        {section.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </motion.section>
  );
}
