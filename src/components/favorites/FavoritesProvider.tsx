"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Ctx = {
  ids: Set<string>;
  loggedIn: boolean;
  isFav: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FavCtx = createContext<Ctx>({ ids: new Set(), loggedIn: false, isFav: () => false, toggle: () => {} });
export const useFavorites = () => useContext(FavCtx);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) {
      setIds(new Set());
      return;
    }
    let alive = true;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => alive && setIds(new Set<string>(d.ids ?? [])))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [loggedIn]);

  const toggle = useCallback(
    (id: string) => {
      const has = ids.has(id);
      // otimista
      setIds((prev) => {
        const n = new Set(prev);
        if (has) n.delete(id);
        else n.add(id);
        return n;
      });
      setToast(has ? "Removido dos favoritos" : "Adicionado aos favoritos ⭐");
      window.clearTimeout((toggle as unknown as { _t?: number })._t);
      (toggle as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 1800);
      fetch("/api/favorites", {
        method: has ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      }).catch(() => {
        // reverte em falha
        setIds((prev) => {
          const n = new Set(prev);
          if (has) n.add(id);
          else n.delete(id);
          return n;
        });
      });
    },
    [ids],
  );

  return (
    <FavCtx.Provider value={{ ids, loggedIn, isFav: (id) => ids.has(id), toggle }}>
      {children}
      {toast && <div className="fav-toast" role="status">{toast}</div>}
    </FavCtx.Provider>
  );
}
