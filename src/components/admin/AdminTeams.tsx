"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { UploadCloud, Loader2, X, Trash2, Plus } from "lucide-react";
import { Jersey } from "@/components/Jersey";
import type { JerseyColors } from "@/data/products";

type TeamItem = { id: string; name: string; colors: JerseyColors; crestUrl: string | null };

export function AdminTeams({ initial }: { initial: TeamItem[] }) {
  const [list, setList] = useState<TeamItem[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form novo time
  const [newName, setNewName] = useState("");
  const [c1, setC1] = useState("#0f8a3d");
  const [c2, setC2] = useState("#ffc400");
  const [c3, setC3] = useState("#ffffff");
  const [adding, setAdding] = useState(false);

  async function addTeam() {
    setError(null);
    if (newName.trim().length < 2) return setError("Informe o nome do time.");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), colors: [c1, c2, c3] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao adicionar.");
        return;
      }
      setList((l) => [...l, { id: data.id, name: newName.trim(), colors: [c1, c2, c3], crestUrl: null }]);
      setNewName("");
    } finally {
      setAdding(false);
    }
  }

  async function delTeam(id: string, name: string) {
    if (!confirm(`Excluir o time "${name}"?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      setList((l) => l.filter((t) => t.id !== id));
    } finally {
      setBusy(null);
    }
  }

  async function uploadCrest(id: string, file: File) {
    setError(null);
    setBusy(id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) {
        setError(upData.error ?? "Falha no upload.");
        return;
      }
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crestUrl: upData.url }),
      });
      if (!res.ok) {
        setError("Falha ao salvar o escudo.");
        return;
      }
      setList((l) => l.map((t) => (t.id === id ? { ...t, crestUrl: upData.url } : t)));
    } finally {
      setBusy(null);
    }
  }

  async function removeCrest(id: string) {
    setBusy(id);
    try {
      await fetch(`/api/admin/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crestUrl: null }),
      });
      setList((l) => l.map((t) => (t.id === id ? { ...t, crestUrl: null } : t)));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {/* adicionar time */}
      <div className="team-add">
        <input
          className="team-add-name"
          placeholder="Novo time (ex: Coritiba)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="team-add-colors" title="Cores do emblema (usadas quando não há escudo)">
          <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} />
          <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} />
          <input type="color" value={c3} onChange={(e) => setC3(e.target.value)} />
        </div>
        <button className="team-add-btn" onClick={addTeam} disabled={adding}>
          {adding ? <Loader2 size={16} className="spin" /> : <><Plus size={16} /> Adicionar time</>}
        </button>
      </div>

      {error && <div className="auth-error" style={{ margin: "0 0 16px" }}>{error}</div>}
      <p className="adm-hint">Envie o escudo (PNG transparente fica melhor). Sem escudo, mostra o emblema colorido.</p>

      <div className="crest-grid">
        {list.map((t) => (
          <div className="crest-card" key={t.id}>
            <button className="team-del" onClick={() => delTeam(t.id, t.name)} disabled={busy === t.id} aria-label="Excluir time">
              <Trash2 size={14} />
            </button>
            <div className="crest-media">
              {t.crestUrl ? <img src={t.crestUrl} alt={t.name} /> : <Jersey colors={t.colors} />}
            </div>
            <b className="crest-name">{t.name}</b>
            <div className="crest-actions">
              <label className="crest-upload">
                {busy === t.id ? <Loader2 size={15} className="spin" /> : <UploadCloud size={15} />}
                {t.crestUrl ? "Trocar" : "Escudo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={busy === t.id}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCrest(t.id, f);
                    e.target.value = "";
                  }}
                />
              </label>
              {t.crestUrl && (
                <button className="crest-remove" onClick={() => removeCrest(t.id)} disabled={busy === t.id} aria-label="Remover escudo">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
