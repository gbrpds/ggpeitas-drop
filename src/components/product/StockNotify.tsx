"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";

export function StockNotify({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMsg("Digite um e-mail válido.");
      return;
    }
    setState("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMsg(data.error ?? "Não foi possível registrar.");
      } else {
        setState("done");
      }
    } catch {
      setState("error");
      setMsg("Falha de conexão.");
    }
  }

  return (
    <div className="stock-out">
      <div className="stock-out-badge">Produto sem estoque</div>
      {state === "done" ? (
        <p className="stock-out-done">
          <Check size={16} /> Pronto! Avisaremos <b>{email}</b> assim que a camisa voltar. 💚
        </p>
      ) : (
        <>
          <p className="stock-out-lead">Receba um e-mail quando voltar ao estoque:</p>
          <form className="stock-out-form" onSubmit={submit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              inputMode="email"
              aria-label="Seu e-mail"
            />
            <button type="submit" disabled={state === "loading"}>
              <BellRing size={16} /> {state === "loading" ? "Enviando…" : "Avise-me"}
            </button>
          </form>
          {state === "error" && msg && <span className="stock-out-err">{msg}</span>}
        </>
      )}
    </div>
  );
}
