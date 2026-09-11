"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Jersey } from "@/components/Jersey";
import { Carousel } from "@/components/Carousel";
import type { JerseyColors } from "@/data/products";

type Team = { id: string; name: string; colors: JerseyColors; crestUrl?: string | null };

export function CollectionsCarousel() {
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    let ok = true;
    fetch("/api/teams")
      .then((r) => r.json())
      .then((rows: Team[]) => {
        if (ok) setTeams(Array.isArray(rows) ? rows : []);
      })
      .catch(() => ok && setTeams([]));
    return () => {
      ok = false;
    };
  }, []);

  // sem times cadastrados → não renderiza a seção
  if (!teams || teams.length === 0) return null;

  return (
    <Carousel title="Coleções Brasileiras" trackClassName="col-track">
      {teams.map((t) => {
        const c0 = t.colors?.[0] ?? "#0f8a3d";
        const c1 = t.colors?.[1] ?? t.colors?.[0] ?? "#0b6e30";
        const bg = {
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,.62) 6%, rgba(0,0,0,.15) 46%, rgba(0,0,0,.08) 100%), linear-gradient(155deg, ${c0} 0%, ${c1} 70%)`,
        };
        return (
          <Link
            key={t.id}
            className="col-card"
            style={bg}
            href={`/busca?team=${encodeURIComponent(t.name)}`}
          >
            <div className="col-card-crest">
              {t.crestUrl ? <img src={t.crestUrl} alt={t.name} /> : <Jersey colors={t.colors} />}
            </div>
            <div className="col-card-foot">
              <b>{t.name}</b>
              <span className="col-card-btn">Ver camisas <ArrowRight size={14} strokeWidth={2.6} /></span>
            </div>
          </Link>
        );
      })}
    </Carousel>
  );
}
