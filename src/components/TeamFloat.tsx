"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useTeam } from "@/store/team";
import { Jersey } from "@/components/Jersey";

export function TeamFloat() {
  const team = useTeam((s) => s.team);
  const hydrated = useTeam((s) => s.hydrate);
  const isHydrated = useTeam((s) => s.hydrated);
  const openModal = useTeam((s) => s.openModal);

  useEffect(() => {
    hydrated();
  }, [hydrated]);

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
          team.crestUrl ? (
            <img src={team.crestUrl} alt={team.name} />
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
