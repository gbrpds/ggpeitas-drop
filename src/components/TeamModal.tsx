"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart } from "lucide-react";
import { teams as seedTeams } from "@/data/teams";
import { Jersey } from "@/components/Jersey";
import type { JerseyColors } from "@/data/products";

const KEY = "gg-team";

type TeamItem = { name: string; colors: JerseyColors; crestUrl?: string | null };

const seed: TeamItem[] = seedTeams.map((t) => ({ name: t.name, colors: t.colors, crestUrl: null }));

export function TeamModal() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<TeamItem | null>(null);
  const [list, setList] = useState<TeamItem[]>(seed);

  // abre só na primeira visita (sem time salvo)
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  // carrega a lista real (times + escudos) quando o modal abre
  useEffect(() => {
    if (!open) return;
    fetch("/api/teams")
      .then((r) => r.json())
      .then((rows: TeamItem[]) => {
        if (Array.isArray(rows) && rows.length) setList(rows);
      })
      .catch(() => {});
  }, [open]);

  const choose = (t: TeamItem) => {
    setChosen(t);
    try {
      localStorage.setItem(KEY, JSON.stringify({ name: t.name, colors: t.colors }));
    } catch {}
  };
  const close = () => setOpen(false);
  const skip = () => {
    try {
      localStorage.setItem(KEY, "skip");
    } catch {}
    setOpen(false);
  };

  const Emblem = ({ t, big }: { t: TeamItem; big?: boolean }) =>
    t.crestUrl ? (
      <img className={big ? "tm-crest big" : "tm-crest"} src={t.crestUrl} alt={t.name} />
    ) : (
      <Jersey colors={t.colors} />
    );

  return (
    <div className={`tm-scrim${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="tm-modal" role="dialog" aria-label="Time de coração">
        <button className="tm-close" onClick={skip} aria-label="Fechar">
          <X size={22} />
        </button>

        {!chosen ? (
          <>
            <div className="tm-head">
              <Heart size={22} className="tm-heart" />
              <h2>Qual é o seu time de coração?</h2>
              <p>Escolha e a gente deixa a loja com a sua cara.</p>
            </div>
            <div className="tm-grid">
              {list.map((t) => (
                <button key={t.name} className="tm-team" onClick={() => choose(t)}>
                  <span className="tm-circ">
                    <Emblem t={t} />
                  </span>
                  <b>{t.name}</b>
                </button>
              ))}
            </div>
            <button className="tm-skip" onClick={skip}>
              Pular por agora
            </button>
          </>
        ) : (
          <div className="tm-done">
            <span className="tm-done-circ">
              <Emblem t={chosen} big />
            </span>
            <h2>
              Você é <b>{chosen.name}</b>! ❤️
            </h2>
            <p>Bora vestir a camisa? Separamos as opções do seu time.</p>
            <div className="tm-done-actions">
              <Link className="btn btn-g" href={`/busca?team=${encodeURIComponent(chosen.name)}`} onClick={close}>
                Ver camisas do {chosen.name}
              </Link>
              <button className="tm-continue" onClick={close}>
                Explorar a loja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
