import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Janela de páginas: mostra primeiras/últimas e vizinhas, com "…" no meio. */
function pageWindow(page: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push(null);
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push(null);
  out.push(total);
  return out;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);
  return (
    <nav className="pager" aria-label="Paginação">
      {page > 1 ? (
        <Link className="pager-btn" href={hrefFor(page - 1)}><ChevronLeft size={16} /> Anterior</Link>
      ) : (
        <span className="pager-btn disabled"><ChevronLeft size={16} /> Anterior</span>
      )}
      <div className="pager-nums">
        {pages.map((p, i) =>
          p === null ? (
            <span key={`gap${i}`} className="pager-gap">…</span>
          ) : (
            <Link key={p} className={`pager-num${p === page ? " on" : ""}`} href={hrefFor(p)}>{p}</Link>
          ),
        )}
      </div>
      {page < totalPages ? (
        <Link className="pager-btn" href={hrefFor(page + 1)}>Próxima <ChevronRight size={16} /></Link>
      ) : (
        <span className="pager-btn disabled">Próxima <ChevronRight size={16} /></span>
      )}
    </nav>
  );
}
