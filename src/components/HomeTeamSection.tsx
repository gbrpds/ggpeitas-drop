"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTeam } from "@/store/team";
import { ProductCard } from "@/components/ProductCard";
import { Jersey } from "@/components/Jersey";
import type { Product } from "@/data/products";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function HomeTeamSection() {
  const team = useTeam((s) => s.team);
  const hydrate = useTeam((s) => s.hydrate);
  const [items, setItems] = useState<Product[] | null>(null);
  const [crest, setCrest] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!team) {
      setItems(null);
      setCrest(null);
      return;
    }
    setCrest(team.crestUrl ?? null);
    let ok = true;
    // produtos do time
    fetch(`/api/products?team=${encodeURIComponent(team.name)}`)
      .then((r) => r.json())
      .then((rows: Product[]) => {
        if (ok) setItems(Array.isArray(rows) ? rows : []);
      })
      .catch(() => ok && setItems([]));
    // escudo atual (resolve mesmo se o localStorage estiver desatualizado)
    fetch("/api/teams")
      .then((r) => r.json())
      .then((rows: { name: string; crestUrl?: string | null }[]) => {
        if (!ok) return;
        const f = rows.find((x) => norm(x.name) === norm(team.name));
        if (f) setCrest(f.crestUrl ?? null);
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, [team]);

  // sem time escolhido → a seção não existe
  if (!team) return null;

  const c0 = team.colors?.[0] ?? "#0f8a3d";
  const c1 = team.colors?.[1] ?? team.colors?.[0] ?? "#0b6e30";
  const heroBg = {
    backgroundImage: `linear-gradient(rgba(0,0,0,.32), rgba(0,0,0,.42)), linear-gradient(105deg, ${c0}, ${c1})`,
  };

  return (
    <section className="wrap team-sec">
      <div className="team-hero" style={heroBg}>
        <div className="team-hero-crest">
          {crest ? <img src={crest} alt={team.name} /> : <Jersey colors={team.colors} />}
        </div>
        <div className="team-hero-text">
          <span className="team-hero-eyebrow">❤️ Seu time do coração</span>
          <h2>Bem-vindo, torcedor do {team.name}!</h2>
          <p>A loja com a cara do seu time. Veja as camisas do {team.name}.</p>
        </div>
        <Link className="team-hero-cta" href={`/busca?team=${encodeURIComponent(team.name)}`}>
          Ver camisas <ArrowRight size={17} strokeWidth={2.4} />
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
