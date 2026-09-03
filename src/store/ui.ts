"use client";

import { create } from "zustand";

type UIState = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

export const useUI = create<UIState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  hydrated: boolean;
  toggle: () => void;
  init: () => void;
};

const applyTheme = (t: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("gg-dark", t === "dark");
  root.removeAttribute("data-theme"); // impede que o host force o tema
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "light",
  hydrated: false,
  init: () => {
    if (typeof document === "undefined") return;
    let t: Theme = "light";
    try {
      t = (localStorage.getItem("gg-theme") as Theme) || "light";
    } catch {}
    applyTheme(t);
    set({ theme: t, hydrated: true });
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("gg-theme", next);
    } catch {}
    set({ theme: next });
  },
}));
