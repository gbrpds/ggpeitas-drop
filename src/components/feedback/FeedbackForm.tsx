"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Check } from "lucide-react";

export function FeedbackForm({ orderId, token }: { orderId: string; token: string | null }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showStar = (i: number) => (hover || rating) >= i;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Escolha de 1 a 5 estrelas.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, token: token ?? undefined, rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Não foi possível enviar.");
      else setDone(true);
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="reset-ok"><Check size={34} strokeWidth={3} /></div>
        <h2 className="reset-ok-title">Obrigado pelo seu feedback!</h2>
        <p className="auth-lead" style={{ marginBottom: 18 }}>
          Sua opinião foi registrada. A gente agradece de coração.
        </p>
        <Link className="btn btn-g" href="/">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    <form className="rv-form" onSubmit={submit}>
      <div className="rv-form-title">Sua nota</div>
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
            <Star size={30} fill={showStar(i) ? "currentColor" : "none"} strokeWidth={1.6} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Conte como foi sua experiência: qualidade da camisa, tamanho, entrega, atendimento…"
        rows={4}
        maxLength={1000}
      />
      {error && <div className="auth-error">{error}</div>}
      <div className="rv-form-actions">
        <button className="rv-submit" type="submit" disabled={saving}>
          {saving ? "Enviando…" : "Enviar feedback"}
        </button>
      </div>
    </form>
  );
}
