"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Check, X, SkipForward } from "lucide-react";

type Result = { title: string; ok: boolean; skipped?: boolean; name?: string; category?: string; reason?: string };

export function YupooImport() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState(10);
  const [active, setActive] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function importar() {
    setError(null);
    setResults([]);
    setProgress(null);
    setRunning(true);
    try {
      // 1) lista os álbuns da categoria
      const listRes = await fetch("/api/admin/import-yupoo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", url }),
      });
      const listData = await listRes.json();
      if (!listRes.ok || !listData.ok) {
        setError(listData.error ?? "Não foi possível ler a categoria.");
        return;
      }
      const albums = (listData.albums as { id: string; title: string }[]).slice(0, limit);
      if (albums.length === 0) {
        setError("Nenhum álbum encontrado nessa URL.");
        return;
      }
      setProgress({ done: 0, total: albums.length });

      // 2) importa um por um (evita timeout e mostra progresso)
      for (let i = 0; i < albums.length; i++) {
        const a = albums[i];
        try {
          const res = await fetch("/api/admin/import-yupoo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "one", url, id: a.id, title: a.title, active }),
          });
          const d = await res.json();
          setResults((prev) => [
            ...prev,
            d.ok
              ? { title: a.title, ok: true, name: d.name, category: d.category }
              : { title: a.title, ok: false, skipped: !!d.skipped, name: d.name, reason: d.reason ?? d.error ?? "falhou" },
          ]);
        } catch {
          setResults((prev) => [...prev, { title: a.title, ok: false, reason: "conexão" }]);
        }
        setProgress({ done: i + 1, total: albums.length });
      }
      router.refresh();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setRunning(false);
    }
  }

  const okCount = results.filter((r) => r.ok).length;

  return (
    <div className="adm-form" style={{ maxWidth: 720 }}>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="co-field">
        <label>URL da categoria no Yupoo</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://kickersz.x.yupoo.com/categories/5308750"
        />
        <span className="co-hint">Cole o link de uma categoria (ou de um álbum específico).</span>
      </div>

      <div className="co-row">
        <div className="co-field">
          <label>Quantos importar</label>
          <input type="number" min={1} max={200} value={limit} onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))} inputMode="numeric" />
        </div>
        <div className="co-field adm-active">
          <label>Publicar</label>
          <label className="adm-switch">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>{active ? "Ativos na loja" : "Como rascunho (inativos)"}</span>
          </label>
        </div>
      </div>

      <button className="co-next" onClick={importar} disabled={running || !url.trim()}>
        {running ? <><Loader2 size={18} className="spin" /> Importando…</> : <><Download size={18} /> Importar do Yupoo</>}
      </button>

      {progress && (
        <div className="yi-progress">
          {progress.done} de {progress.total} · {okCount} criados
        </div>
      )}

      {results.length > 0 && (
        <div className="yi-results">
          {results.map((r, i) => (
            <div key={i} className={`yi-row${r.ok ? " ok" : r.skipped ? " skip" : " fail"}`}>
              {r.ok ? <Check size={15} /> : r.skipped ? <SkipForward size={15} /> : <X size={15} />}
              <span className="yi-name">{r.ok ? r.name : r.name ?? r.title}</span>
              <span className="yi-tag">{r.ok ? r.category : r.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
