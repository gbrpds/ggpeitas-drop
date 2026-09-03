"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const IDLE_MS = 20 * 60 * 1000; // 20 minutos
const KEY = "gg-last-activity";

/**
 * Desloga automaticamente após 20 min sem interação do usuário.
 * Qualquer atividade (mouse, teclado, toque, scroll) reinicia o contador.
 * A "última atividade" é compartilhada entre abas via localStorage.
 */
export function IdleLogout() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let last = Date.now();
    let lastWrite = 0;
    try {
      const saved = Number(localStorage.getItem(KEY));
      if (saved) last = saved;
    } catch {}

    const save = () => {
      try {
        localStorage.setItem(KEY, String(last));
      } catch {}
    };
    save();

    const bump = () => {
      const n = Date.now();
      last = n;
      if (n - lastWrite > 3000) {
        lastWrite = n;
        save();
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    const check = () => {
      let l = last;
      try {
        const saved = Number(localStorage.getItem(KEY));
        if (saved) l = Math.max(l, saved);
      } catch {}
      if (Date.now() - l >= IDLE_MS) {
        cleanup();
        try {
          localStorage.removeItem(KEY);
        } catch {}
        signOut({ callbackUrl: "/conta?timeout=1" });
      }
    };

    const iv = setInterval(check, 15000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);

    function cleanup() {
      clearInterval(iv);
      events.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onVis);
    }

    return cleanup;
  }, [status]);

  return null;
}
