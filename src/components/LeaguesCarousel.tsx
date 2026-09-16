import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Carousel } from "@/components/Carousel";
import { leagueCollections } from "@/data/collections";

/** Carrossel de cards largos por liga/região (ex.: Gigantes Europeus). */
export function LeaguesCarousel() {
  if (leagueCollections.length === 0) return null;
  return (
    <Carousel title="Ligas do mundo" trackClassName="col-track">
      {leagueCollections.map((c) => {
        // com imagem: escurece um pouco por cima (texto legível) e mantém o
        // gradiente de cor por baixo como fallback caso a imagem não exista.
        const bg: React.CSSProperties = c.image
          ? {
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,.55), rgba(0,0,0,.2)), url(${c.image}), linear-gradient(120deg, ${c.colors[0]}, ${c.colors[1]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,.35), rgba(0,0,0,.05)), linear-gradient(120deg, ${c.colors[0]}, ${c.colors[1]})`,
            };
        return (
          <Link key={c.title} className="league-card" style={bg} href={c.href}>
            <b className="league-card-title">{c.title}</b>
            <span className="league-card-cta">Ver coleção <ArrowRight size={15} strokeWidth={2.6} /></span>
          </Link>
        );
      })}
    </Carousel>
  );
}
