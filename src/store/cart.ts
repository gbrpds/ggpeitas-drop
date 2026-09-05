"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

/** Valor adicional da personalização (nome + número), por camisa — espelha o servidor. */
export const CUSTOM_FEE = 20;

export type CartItem = {
  id: string;
  productId: string; // id cru do produto (para o servidor recalcular o preço real)
  name: string;
  price: number; // apenas exibição no cliente — o servidor NUNCA confia nisso
  qty: number;
  colors: Product["colors"];
  image?: string; // foto principal (quando o produto tem foto real)
  promo?: boolean; // participa do "Leve 3, Pague 2"
  size?: string;
  version?: string;
  customName?: string; // personalização (nome)
  customNumber?: string; // personalização (número)
};

export type AddOptions = {
  size?: string;
  version?: string;
  qty?: number;
  customName?: string;
  customNumber?: string;
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
          const { size, version, qty = 1, customName, customNumber } = opts;
          const persLabel = [customName?.trim(), customNumber?.trim()].filter(Boolean).join(" ");
          // id único por variação (produto + tamanho + versão + personalização)
          const id = [p.id, size, version, persLabel].filter(Boolean).join("-");
          const found = state.items.find((i) => i.id === id);
          if (found) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          const suffix = [size, version].filter(Boolean).join(" · ");
          let name = suffix ? `${p.name} (${suffix})` : p.name;
          if (persLabel) name += ` — ${persLabel}`;
          return {
            items: [
              ...state.items,
              {
                id,
                productId: p.id,
                name,
                price: p.now + (persLabel ? CUSTOM_FEE : 0), // +R$20 se personalizada
                qty,
                colors: p.colors,
                image: p.images?.[0],
                promo: p.promo3x2,
                size,
                version,
                customName: customName?.trim() || undefined,
                customNumber: customNumber?.trim() || undefined,
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
