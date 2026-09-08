"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Check, ArrowRight } from "lucide-react";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("A senha precisa ter ao menos 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Não foi possível redefinir.");
      else setDone(true);
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-card">
        <div className="auth-error">Link inválido. Solicite a recuperação novamente.</div>
        <Link className="btn btn-g" href="/recuperar-senha">Recuperar senha</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="reset-ok"><Check size={34} strokeWidth={3} /></div>
        <h2 className="reset-ok-title">Senha trocada com sucesso!!</h2>
        <p className="auth-lead" style={{ marginBottom: 18 }}>Já pode entrar com a sua nova senha.</p>
        <Link className="btn btn-g" href="/conta">Ir para o site <ArrowRight size={18} strokeWidth={2.4} /></Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="r-pass">Nova senha</label>
          <input id="r-pass" type="password" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
        </div>
        <div className="auth-field">
          <label htmlFor="r-conf">Confirmar nova senha</label>
          <input id="r-conf" type="password" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required minLength={6} placeholder="Repita a senha" />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Trocar senha"}
        </button>
      </form>
    </div>
  );
}
