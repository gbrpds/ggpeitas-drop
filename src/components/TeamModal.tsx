"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart } from "lucide-react";
import { teams as seedTeams } from "@/data/teams";
import { Jersey } from "@/components/Jersey";
import { useTeam, type TeamPick } from "@/store/team";
import type { JerseyColors } from "@/data/products";

type TeamItem = { name: string; colors: JerseyColors; crestUrl?: string | null };

const seed: TeamItem[] = seedTeams.map((t) => ({ name: t.name, colors: t.colors, crestUrl: null }));

export function TeamModal() {
  const open = useTeam((s) => s.open);
  const hydrate = useTeam((s) => s.hydrate);
  const choose = useTeam((s) => s.choose);
  const close = useTeam((s) => s.close);

  const [list, setList] = useState<TeamItem[]>(seed);
  const [done, setDone] = useState<TeamItem | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ao abrir: mostra a grade (reseta o passo "done") e carrega a lista real
  useEffect(() => {
    if (!open) return;
    setDone(null);
    fetch("/api/teams")
      .then((r) => r.json())
      .then((rows: TeamItem[]) => {
        if (Array.isArray(rows) && rows.length) setList(rows);
      })
      .catch(() => {});
  }, [open]);

  const pick = (t: TeamItem) => {
    choose({ name: t.name, colors: t.colors, crestUrl: t.crestUrl ?? null } as TeamPick);
    setDone(t);
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
        <button className="tm-close" onClick={close} aria-label="Fechar">
          <X size={22} />
        </button>

        {!done ? (
          <>
            <div className="tm-head">
              <Heart size={22} className="tm-heart" />
              <h2>Qual é o seu time de coração?</h2>
              <p>Escolha e a gente deixa a loja com a sua cara.</p>
            </div>
            <div className="tm-grid">
              {list.map((t) => (
                <button key={t.name} className="tm-team" onClick={() => pick(t)}>
                  <span className="tm-circ">
                    <Emblem t={t} />
                  </span>
                  <b>{t.name}</b>
                </button>
              ))}
            </div>
            <button className="tm-skip" onClick={close}>
              Pular por agora
            </button>
          </>
        ) : (
          <div className="tm-done">
            <span className="tm-done-circ">
              <Emblem t={done} big />
            </span>
            <h2>
              Você é <b>{done.name}</b>! ❤️
            </h2>
            <p>Bora vestir a camisa? Separamos as opções do seu time.</p>
            <div className="tm-done-actions">
              <Link className="btn btn-g" href={`/busca?team=${encodeURIComponent(done.name)}`} onClick={close}>
                Ver camisas do {done.name}
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
