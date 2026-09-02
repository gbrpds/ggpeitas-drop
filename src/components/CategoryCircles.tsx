import Link from "next/link";
import { categories } from "@/data/products";
import { Jersey } from "./Jersey";

export function CategoryCircles() {
  return (
    <section className="cats-sec wrap">
      <h2 className="sec-title">🌏 Navegue por categoria</h2>
      <div className="cats">
        {categories.map((c) => (
          <Link className="cat" href={c.href} key={c.name}>
            <span className="circ">
              <Jersey colors={c.colors} />
            </span>
            <b>{c.name}</b>
          </Link>
        ))}
      </div>
    </section>
  );
}
