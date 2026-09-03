"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart } from "lucide-react";
import { teams, type Team } from "@/data/teams";
import { Jersey } from "@/components/Jersey";

const KEY = "gg-team";

export function TeamModal() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Team | null>(null);
  const [crests, setCrests] = useState<Record<string, string>>({});

  // abre só na primeira visita (sem time salvo)
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  // carrega os escudos oficiais (se houver) quando o modal abre
  useEffect(() => {
    if (!open) return;
    fetch("/api/team-crests")
      .then((r) => r.json())
      .then((m) => setCrests(m ?? {}))
      .catch(() => {});
  }, [open]);

  const choose = (t: Team) => {
    setChosen(t);
    try {
      localStorage.setItem(KEY, JSON.stringify(t));
    } catch {}
  };

  const close = () => setOpen(false);

  const skip = () => {
    try {
      localStorage.setItem(KEY, "skip");
    } catch {}
    setOpen(false);
  };

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
              {teams.map((t) => (
                <button key={t.name} className="tm-team" onClick={() => choose(t)}>
                  <span className="tm-circ">
                    {crests[t.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="tm-crest" src={crests[t.name]} alt={t.name} />
                    ) : (
                      <Jersey colors={t.colors} />
                    )}
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
              {crests[chosen.name] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="tm-crest" src={crests[chosen.name]} alt={chosen.name} />
              ) : (
                <Jersey colors={chosen.colors} />
              )}
            </span>
            <h2>
              Você é <b>{chosen.name}</b>! ❤️
            </h2>
            <p>Bora vestir a camisa? Separamos as opções do seu time.</p>
            <div className="tm-done-actions">
              <Link
                className="btn btn-g"
                href={`/busca?team=${encodeURIComponent(chosen.name)}`}
                onClick={close}
              >
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
