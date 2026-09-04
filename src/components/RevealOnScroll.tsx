"use client";

import { useEffect } from "react";

/**
 * Revela elementos com a classe `.reveal` conforme entram na viewport.
 * Progressive enhancement: só esconde/anima quando o JS roda (marca o <html>
 * com .reveal-ready). Sem JS, o conteúdo aparece normal.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observeAll = () =>
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => io.observe(el));

    observeAll();
    // pega elementos adicionados após navegações do client-side
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
