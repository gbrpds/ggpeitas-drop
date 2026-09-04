import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROMO_HREF } from "@/lib/promo";

export function PromoBanner() {
  return (
    <section className="promo-sec wrap reveal">
      <div className="promo">
        <div>
          <span className="eb">Oferta relâmpago</span>
          <h2>Leve 3, pague 2</h2>
          <p>
            Em toda a coleção de clubes nacionais. Monte o kit da família e economize de verdade.
          </p>
        </div>
        <Link className="btn btn-g" href={PROMO_HREF} style={{ background: "var(--yellow)", color: "#241b00" }}>
          Aproveitar agora
          <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </section>
  );
}
