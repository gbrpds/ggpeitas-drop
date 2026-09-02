import { Truck, ShieldCheck, Ruler, Award } from "lucide-react";
import type { Product } from "@/data/products";
import { defaultDescription } from "@/lib/product";

const specs = [
  { Icon: Award, text: "Tailandesa 1ª linha — acabamento premium" },
  { Icon: Ruler, text: "Tamanhos P ao XGG (torcedor e jogador)" },
  { Icon: Truck, text: "Frete grátis e envio para todo o Brasil" },
  { Icon: ShieldCheck, text: "Troca em até 7 dias · compra segura" },
];

export function Description({ product }: { product: Product }) {
  return (
    <section className="pdesc wrap">
      <h2>Descrição</h2>
      <p>{defaultDescription(product)}</p>
      <div className="specs">
        {specs.map(({ Icon, text }) => (
          <div className="spec" key={text}>
            <Icon strokeWidth={1.8} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
