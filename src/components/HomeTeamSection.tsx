"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTeam } from "@/store/team";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";

export function HomeTeamSection() {
  const team = useTeam((s) => s.team);
  const hydrate = useTeam((s) => s.hydrate);
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!team) {
      setItems(null);
      return;
    }
    let ok = true;
    fetch(`/api/products?team=${encodeURIComponent(team.name)}`)
      .then((r) => r.json())
      .then((rows: Product[]) => {
        if (ok) setItems(Array.isArray(rows) ? rows : []);
      })
      .catch(() => ok && setItems([]));
    return () => {
      ok = false;
    };
  }, [team]);

  // sem time escolhido → a seção não existe
  if (!team) return null;

  return (
    <section className="car-sec wrap team-sec">
      <div className="car-head">
        <h2>❤️ Seu time do coração: {team.name}</h2>
        <Link className="see" href={`/busca?team=${encodeURIComponent(team.name)}`}>
          Ver tudo <ArrowRight strokeWidth={2.4} />
        </Link>
      </div>
      {items === null ? (
        <div className="team-sec-loading">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="team-sec-empty">
          Em breve, camisas do <b>{team.name}</b> por aqui! Enquanto isso, dá uma olhada nos destaques abaixo. 👇
        </div>
      ) : (
        <div className="car">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
