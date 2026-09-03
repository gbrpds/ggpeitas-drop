"use client";

import { create } from "zustand";
import type { JerseyColors } from "@/data/products";

export type TeamPick = { name: string; colors: JerseyColors; crestUrl?: string | null };

const KEY = "gg-team";

type TeamState = {
  team: TeamPick | null;
  hydrated: boolean;
  open: boolean;
  hydrate: () => void;
  choose: (t: TeamPick) => void;
  openModal: () => void;
  close: () => void;
};

export const useTeam = create<TeamState>((set, get) => ({
  team: null,
  hydrated: false,
  open: false,
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    let team: TeamPick | null = null;
    let firstVisit = false;
    try {
      const v = localStorage.getItem(KEY);
      if (!v) firstVisit = true;
      else if (v !== "skip") team = JSON.parse(v);
    } catch {}
    set({ team, hydrated: true, open: firstVisit });
  },
  choose: (t) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(t));
    } catch {}
    set({ team: t });
  },
  openModal: () => set({ open: true }),
  close: () =>
    set((s) => {
      if (!s.team) {
        try {
          if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, "skip");
        } catch {}
      }
      return { open: false };
    }),
}));
