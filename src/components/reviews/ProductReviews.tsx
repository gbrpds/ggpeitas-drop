"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, BadgeCheck, Trash2 } from "lucide-react";
import { Stars } from "./Stars";
import type { ReviewItem, ReviewSummary } from "@/lib/reviews";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function ProductReviews({
  productId,
  productName,
  summary,
  list,
}: {
  productId: string;
  productName: string;
  summary: ReviewSummary;
  list: ReviewItem[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const loggedIn = !!session?.user;
  const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const mine = list.find((r) => r.mine);
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Escolha de 1 a 5 estrelas.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
      } else {
        setShowForm(false);
        router.refresh();
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {
      /* ignora */
    }
  }

  const showStar = (i: number) => (hover || rating) >= i;

  return (
    <section className="rv wrap" id="avaliacoes">
      <h2 className="rv-title">Avaliações</h2>

      <div className="rv-top">
        <div className="rv-score">
          <div className="rv-avg">{summary.count ? summary.avg.toFixed(1) : "—"}</div>
          <Stars value={summary.avg} size={18} />
          <div className="rv-count">
            {summary.count === 0
              ? "Sem avaliações ainda"
              : `${summary.count} ${summary.count === 1 ? "avaliação" : "avaliações"}`}
          </div>
        </div>
        {summary.count > 0 && (
          <div className="rv-dist">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = summary.dist[s - 1];
              const pct = summary.count ? Math.round((n / summary.count) * 100) : 0;
              return (
                <div className="rv-dist-row" key={s}>
                  <span className="rv-dist-label">{s}★</span>
                  <span className="rv-dist-bar"><span style={{ width: `${pct}%` }} /></span>
                  <span className="rv-dist-n">{n}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Área de escrever avaliação */}
      {loggedIn ? (
        !showForm && !mine ? (
          <button className="rv-write-btn" onClick={() => setShowForm(true)}>
            <Star size={16} /> Avaliar este produto
          </button>
        ) : (
          <form className="rv-form" onSubmit={submit}>
            <div className="rv-form-title">{mine ? "Editar sua avaliação" : `Avaliar ${productName}`}</div>
            <div className="rv-picker" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  className={`rv-pick${showStar(i) ? " on" : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
                >
                  <Star size={26} fill={showStar(i) ? "currentColor" : "none"} strokeWidth={1.6} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte o que achou da camisa (qualidade, tamanho, entrega)…"
              rows={3}
              maxLength={1000}
            />
            {error && <div className="auth-error">{error}</div>}
            <div className="rv-form-actions">
              <button className="rv-submit" type="submit" disabled={saving}>
                {saving ? "Enviando…" : mine ? "Salvar alterações" : "Enviar avaliação"}
              </button>
              {(showForm || mine) && (
                <button type="button" className="rv-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
              )}
            </div>
          </form>
        )
      ) : (
        <div className="rv-login">
          <Link className="btn btn-g" href={`/conta?next=/produto/${productId}`}>Entrar para avaliar</Link>
        </div>
      )}

      {/* Lista */}
      <div className="rv-list">
        {list.length === 0 ? (
          <p className="rv-empty">Seja o primeiro a avaliar este produto. 💬</p>
        ) : (
          list.map((r) => (
            <div className="rv-item" key={r.id}>
              <div className="rv-item-head">
                <div className="rv-item-who">
                  <b>{r.userName}</b>
                  {r.verified && (
                    <span className="rv-verified"><BadgeCheck size={13} /> Compra verificada</span>
                  )}
                </div>
                <div className="rv-item-meta">
                  <Stars value={r.rating} size={13} />
                  <span className="rv-date">{fmtDate(r.createdAt)}</span>
                  {(r.mine || isAdmin) && (
                    <button className="rv-del" onClick={() => remove(r.id)} aria-label="Excluir avaliação">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="rv-item-text">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
