"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Jersey } from "@/components/Jersey";
import type { JerseyColors } from "@/data/products";

type Team = { id: string; name: string; colors: JerseyColors; crestUrl?: string | null };

function TeamCard({ t }: { t: Team }) {
  const c0 = t.colors?.[0] ?? "#0f8a3d";
  const c1 = t.colors?.[1] ?? t.colors?.[0] ?? "#0b6e30";
  const bg = {
    backgroundImage: `linear-gradient(to top, rgba(0,0,0,.62) 6%, rgba(0,0,0,.15) 46%, rgba(0,0,0,.08) 100%), linear-gradient(155deg, ${c0} 0%, ${c1} 70%)`,
  };
  return (
    <Link className="col-card" style={bg} href={`/busca?team=${encodeURIComponent(t.name)}`}>
      <div className="col-card-crest">
        {t.crestUrl ? <img src={t.crestUrl} alt={t.name} /> : <Jersey colors={t.colors} />}
      </div>
      <div className="col-card-foot">
        <b>{t.name}</b>
        <span className="col-card-btn">Ver camisas <ArrowRight size={14} strokeWidth={2.6} /></span>
      </div>
    </Link>
  );
}

export function CollectionsCarousel() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  // auto-scroll infinito + rolagem manual (arrasta/swipe/roda). Pausa ao
  // interagir ou passar o mouse; loop contínuo com itens duplicados.
  useEffect(() => {
    const el = wrapRef.current;
    if (!teams || teams.length === 0 || !el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let hovering = false;
    let idleUntil = 0;
    const bump = () => (idleUntil = Date.now() + 2500);
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    el.addEventListener("pointerdown", bump);
    el.addEventListener("wheel", bump, { passive: true });
    el.addEventListener("touchstart", bump, { passive: true });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    const step = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (!reduced && !hovering && Date.now() > idleUntil) el.scrollLeft += 0.5;
        // loop infinito nos dois sentidos
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft <= 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", bump);
      el.removeEventListener("wheel", bump);
      el.removeEventListener("touchstart", bump);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [teams]);

  // sem times cadastrados → não renderiza a seção
  if (!teams || teams.length === 0) return null;

  return (
    <section className="car-sec wrap reveal">
      <div className="car-head">
        <h2>Coleções Brasileiras</h2>
      </div>
      <div className="col-marquee-wrap" ref={wrapRef}>
        <div className="col-marquee">
          {teams.map((t) => <TeamCard key={t.id} t={t} />)}
          {teams.map((t) => <TeamCard key={`dup-${t.id}`} t={t} />)}
        </div>
      </div>
    </section>
  );
}
