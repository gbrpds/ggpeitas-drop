"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, Check } from "lucide-react";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else setError("Não foi possível enviar agora. Tente novamente.");
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <div className="auth-info" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Check size={18} />
          <span>
            Se existir uma conta com <b>{email}</b>, enviamos um link para redefinir a senha.
            Verifique sua caixa de entrada (e o spam).
          </span>
        </div>
        <Link className="auth-back-link" href="/conta"><ArrowLeft size={15} /> Voltar para entrar</Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="f-email">E-mail da conta</label>
          <input
            id="f-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="voce@email.com"
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : <><Mail size={18} /> Enviar link de recuperação</>}
        </button>
      </form>
      <Link className="auth-back-link" href="/conta"><ArrowLeft size={15} /> Voltar para entrar</Link>
    </div>
  );
}
