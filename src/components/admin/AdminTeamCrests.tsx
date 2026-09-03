"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { teams } from "@/data/teams";
import { Jersey } from "@/components/Jersey";

export function AdminTeamCrests({ initial }: { initial: Record<string, string> }) {
  const [crests, setCrests] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(name: string, file: File) {
    setError(null);
    setBusy(name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) {
        setError(upData.error ?? "Falha no upload.");
        return;
      }
      const save = await fetch("/api/admin/team-crest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, crestUrl: upData.url }),
      });
      if (!save.ok) {
        const d = await save.json();
        setError(d.error ?? "Falha ao salvar.");
        return;
      }
      setCrests((c) => ({ ...c, [name]: upData.url }));
    } finally {
      setBusy(null);
    }
  }

  async function remove(name: string) {
    setBusy(name);
    try {
      await fetch("/api/admin/team-crest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, crestUrl: null }),
      });
      setCrests((c) => {
        const n = { ...c };
        delete n[name];
        return n;
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <p className="adm-hint">
        Envie o escudo de cada time (PNG com fundo transparente fica melhor). Quem não tiver escudo
        continua com o emblema colorido.
      </p>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="crest-grid">
        {teams.map((t) => {
          const url = crests[t.name];
          return (
            <div className="crest-card" key={t.name}>
              <div className="crest-media">
                {url ? <img src={url} alt={t.name} /> : <Jersey colors={t.colors} />}
              </div>
              <b className="crest-name">{t.name}</b>
              <div className="crest-actions">
                <label className="crest-upload">
                  {busy === t.name ? <Loader2 size={15} className="spin" /> : <UploadCloud size={15} />}
                  {url ? "Trocar" : "Enviar"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={busy === t.name}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(t.name, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {url && (
                  <button className="crest-remove" onClick={() => remove(t.name)} disabled={busy === t.name} aria-label="Remover">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
