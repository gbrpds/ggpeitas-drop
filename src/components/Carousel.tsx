"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/**
 * Carrossel horizontal reutilizável: setas de navegação + barrinha de progresso
 * arrastável. No mobile, o arrastar nativo (swipe) já funciona.
 */
export function Carousel({
  title,
  titleClassName,
  seeHref,
  seeLabel = "Ver tudo",
  trackClassName = "car",
  children,
}: {
  title: string;
  titleClassName?: string;
  seeHref?: string;
  seeLabel?: string;
  trackClassName?: string;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ w: 100, left: 0 });
  const [overflow, setOverflow] = useState(false);
  const draggingRef = useRef(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    const has = scrollWidth - clientWidth > 4;
    setOverflow(has);
    if (!has) {
      setThumb({ w: 100, left: 0 });
      return;
    }
    const w = (clientWidth / scrollWidth) * 100;
    const left = (scrollLeft / scrollWidth) * 100;
    setThumb({ w, left });
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    // reavalia após imagens/cards carregarem (dimensões podem mudar)
    const t1 = setTimeout(update, 200);
    const t2 = setTimeout(update, 700);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [update, children]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  const scrubTo = (clientX: number) => {
    const el = trackRef.current;
    const bar = barRef.current;
    if (!el || !bar) return;
    const rect = bar.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    el.scrollLeft = frac * (el.scrollWidth - el.clientWidth);
  };

  return (
    <section className="car-sec wrap reveal">
      <div className="car-head">
        <h2 className={titleClassName}>{title}</h2>
        <div className="car-head-right">
          {seeHref && (
            <Link className="see" href={seeHref}>
              {seeLabel} <ArrowRight strokeWidth={2.4} />
            </Link>
          )}
          {overflow && (
            <div className="car-arrows">
              <button type="button" aria-label="Anterior" onClick={() => scrollByDir(-1)}>
                <ChevronLeft size={20} strokeWidth={2.4} />
              </button>
              <button type="button" aria-label="Próximo" onClick={() => scrollByDir(1)}>
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={trackClassName} ref={trackRef} onScroll={update}>
        {children}
      </div>

      {overflow && (
        <div
          className="car-bar"
          ref={barRef}
          onPointerDown={(e) => {
            draggingRef.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            scrubTo(e.clientX);
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) scrubTo(e.clientX);
          }}
          onPointerUp={(e) => {
            draggingRef.current = false;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          }}
        >
          <div className="car-bar-thumb" style={{ width: `${thumb.w}%`, left: `${thumb.left}%` }} />
        </div>
      )}
    </section>
  );
}
