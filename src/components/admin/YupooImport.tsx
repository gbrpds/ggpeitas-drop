"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Check, X, SkipForward } from "lucide-react";

type Result = { title: string; ok: boolean; skipped?: boolean; name?: string; category?: string; reason?: string };

export function YupooImport() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [teamName, setTeamName] = useState("");
  const [qtd, setQtd] = useState(50);
  const [active, setActive] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function importar(limit: number) {
    setError(null);
    if (!url.trim()) return setError("Cole a URL da página do time no Yupoo.");
    if (!teamName.trim()) return setError("Digite o nome do time (ex.: Atlético-MG).");
    setResults([]);
    setProgress(null);
    setRunning(true);
    try {
      // 1) lista os álbuns da página do time
      const listRes = await fetch("/api/admin/import-yupoo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", url }),
      });
      const listData = await listRes.json();
      if (!listRes.ok || !listData.ok) {
        setError(listData.error ?? "Não foi possível ler a página.");
        return;
      }
      const albums = (listData.albums as { id: string; title: string }[]).slice(0, limit);
      if (albums.length === 0) {
        setError("Nenhuma camisa encontrada nessa URL.");
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
            body: JSON.stringify({ action: "one", url, id: a.id, title: a.title, team: teamName.trim(), active }),
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
        <label>URL da página do time no Yupoo</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://kickersz.x.yupoo.com/categories/973290?isSubCate=true"
        />
      </div>

      <div className="co-field">
        <label>Nome do time</label>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Ex.: Atlético-MG"
        />
        <span className="co-hint">Define o time, a categoria/tag e faz o filtro funcionar. Use o nome como no site.</span>
      </div>

      <div className="co-field adm-active">
        <label>Publicar</label>
        <label className="adm-switch">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>{active ? "Ativos na loja" : "Como rascunho (inativos)"}</span>
        </label>
      </div>

      <div className="yi-actions">
        <button className="co-next" onClick={() => importar(Number.POSITIVE_INFINITY)} disabled={running}>
          {running ? <><Loader2 size={18} className="spin" /> Importando…</> : <><Download size={18} /> Importar todas</>}
        </button>
        <div className="yi-qtd">
          <input
            type="number"
            min={1}
            max={5000}
            value={qtd}
            onChange={(e) => setQtd(Math.max(1, Number(e.target.value) || 1))}
            inputMode="numeric"
            disabled={running}
          />
          <button className="co-next alt" onClick={() => importar(qtd)} disabled={running}>
            Importar {qtd}
          </button>
        </div>
      </div>

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
