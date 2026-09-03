"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  colors: Product["colors"];
  image?: string; // foto principal (quando o produto tem foto real)
  size?: string;
  version?: string;
};

export type AddOptions = {
  size?: string;
  version?: string;
  qty?: number;
};

type CartState = {
  items: CartItem[];
  addItem: (p: Product, opts?: AddOptions) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (p, opts = {}) =>
        set((state) => {
          const { size, version, qty = 1 } = opts;
          // id único por variação (produto + tamanho + versão)
          const id = [p.id, size, version].filter(Boolean).join("-");
          const found = state.items.find((i) => i.id === id);
          if (found) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          const suffix = [size, version].filter(Boolean).join(" · ");
          return {
            items: [
              ...state.items,
              {
                id,
                name: suffix ? `${p.name} (${suffix})` : p.name,
                price: p.now,
                qty,
                colors: p.colors,
                image: p.images?.[0],
                size,
                version,
              },
            ],
          };
        }),
      setQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: "gg-cart" },
  ),
);
