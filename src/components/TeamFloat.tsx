"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useTeam } from "@/store/team";
import { Jersey } from "@/components/Jersey";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function TeamFloat() {
  const team = useTeam((s) => s.team);
  const hydrate = useTeam((s) => s.hydrate);
  const isHydrated = useTeam((s) => s.hydrated);
  const openModal = useTeam((s) => s.openModal);
  const [crest, setCrest] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // resolve o escudo atual do time (mesmo que o salvo esteja desatualizado)
  useEffect(() => {
    if (!team) {
      setCrest(null);
      return;
    }
    setCrest(team.crestUrl ?? null);
    let ok = true;
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

  if (!isHydrated) return null;

  return (
    <button
      className={`team-float${team ? " has-team" : ""}`}
      onClick={openModal}
      aria-label={team ? `Time: ${team.name} (clique para trocar)` : "Selecione seu time"}
      title={team ? `${team.name} — clique para trocar` : "Selecione seu time"}
    >
      <span className="team-float-badge">
        {team ? (
          crest ? (
            <img src={crest} alt={team.name} />
          ) : (
            <Jersey colors={team.colors} />
          )
        ) : (
          <Heart strokeWidth={2} />
        )}
      </span>
      <span className="team-float-label">{team ? team.name : "Selecione seu time"}</span>
    </button>
  );
}
