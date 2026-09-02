"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

type Mode = "login" | "register";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function AuthForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Não foi possível criar a conta.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      router.push("/conta");
      router.refresh();
    } catch {
      setError("Algo deu errado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setError(null); }}>
          Entrar
        </button>
        <button className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setError(null); }}>
          Criar conta
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="auth-field">
            <label htmlFor="a-name">Nome</label>
            <input id="a-name" type="text" autoComplete="name" value={name}
              onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" />
          </div>
        )}
        <div className="auth-field">
          <label htmlFor="a-email">E-mail</label>
          <input id="a-email" type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required placeholder="voce@email.com" />
        </div>
        <div className="auth-field">
          <label htmlFor="a-pass">Senha</label>
          <input id="a-pass" type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"} minLength={6} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <Loader2 size={18} className="spin" />
          ) : mode === "login" ? (
            <><LogIn size={18} /> Entrar</>
          ) : (
            <><UserPlus size={18} /> Criar minha conta</>
          )}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="auth-divider"><span>ou</span></div>
          <button className="auth-google" onClick={() => signIn("google", { callbackUrl: "/conta" })}>
            <GoogleIcon /> Continuar com Google
          </button>
        </>
      )}
    </div>
  );
}
