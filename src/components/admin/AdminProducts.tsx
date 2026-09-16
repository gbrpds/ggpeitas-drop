"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Pencil, Search, ExternalLink, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { brl } from "@/lib/format";
import { genderOf, modeloOf } from "@/lib/facets";
import { leagueOfTeam } from "@/lib/euro-teams";

const CAT_LABEL: Record<string, string> = {
  brasileirao: "Brasileirão",
  europa: "Europa",
  selecoes: "Seleções",
  retro: "Retrô",
  feminina: "Feminina",
  infantil: "Conjuntos Esportivos",
};
const catLabel = (c: string) => CAT_LABEL[c] ?? c.charAt(0).toUpperCase() + c.slice(1);

/** Miniatura do card com setas para ver todas as fotos do produto. */
function CardMedia({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  if (!images?.length) return <span className="adm-noimg">sem foto</span>;
  const go = (d: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setI((x) => (x + d + images.length) % images.length);
  };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt="" />
      {images.length > 1 && (
        <>
          <button type="button" className="apc-nav prev" onClick={go(-1)} aria-label="Foto anterior"><ChevronLeft size={18} /></button>
          <button type="button" className="apc-nav next" onClick={go(1)} aria-label="Próxima foto"><ChevronRight size={18} /></button>
          <span className="apc-count">{i + 1}/{images.length}</span>
        </>
      )}
    </>
  );
}

type Row = {
  id: string;
  name: string;
  team: string | null;
  category: string;
  priceCents: number;
  active: boolean;
  inStock: boolean;
  promo3x2: boolean;
  images: string[];
};

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type TeamGroup = { label: string; teams: string[] };

/** Seletor de time agrupado por coleção (Brasileirão/Europa/Seleções), com grupos expansíveis. */
function TeamCombo({ groups, value, total, onChange }: { groups: TeamGroup[]; value: string; total: number; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = norm(query);
  // com busca, filtra os times e expande automaticamente os grupos com match
  const filtered = groups
    .map((g) => ({ ...g, teams: q ? g.teams.filter((t) => norm(t).includes(q)) : g.teams }))
    .filter((g) => g.teams.length > 0);

  return (
    <div className="adm-combo" ref={ref}>
      <input
        className="adm-select adm-combo-input"
        value={open ? query : value}
        placeholder={value ? value : `Todos os times (${total})`}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="adm-combo-list">
          <button type="button" className="adm-combo-opt" onClick={() => { onChange(""); setOpen(false); }}>
            Todos os times ({total})
          </button>
          {filtered.map((g) => {
            const isOpen = q ? true : !!expanded[g.label];
            return (
              <div key={g.label} className="adm-combo-group">
                <button type="button" className="adm-combo-head" onClick={() => setExpanded((e) => ({ ...e, [g.label]: !e[g.label] }))}>
                  <span>{g.label} <span className="adm-combo-gcount">{g.teams.length}</span></span>
                  <ChevronRight size={15} className={`adm-combo-chev${isOpen ? " open" : ""}`} />
                </button>
                {isOpen && g.teams.map((t) => (
                  <button type="button" key={t} className={`adm-combo-opt sub${t === value ? " on" : ""}`} onClick={() => { onChange(t); setOpen(false); }}>
                    {t}
                  </button>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="adm-combo-empty">Nenhum time</div>}
        </div>
      )}
    </div>
  );
}

export function AdminProducts({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  useEffect(() => setItems(rows), [rows]); // sincroniza quando o servidor manda dados novos
  const [busy, setBusy] = useState<string | null>(null);
  const [team, setTeam] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [gender, setGender] = useState("");
  const [modelo, setModelo] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyOut, setOnlyOut] = useState(false);
  const [sideOpen, setSideOpen] = useState(false); // toggle no mobile

  // mantém o filtro ao editar uma camisa e voltar (persiste entre navegações)
  const firstSave = useRef(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gg-admin-filter");
      if (raw) {
        const f = JSON.parse(raw);
        if (f.team) setTeam(f.team);
        if (f.q) setQ(f.q);
        if (f.cat) setCat(f.cat);
        if (f.gender) setGender(f.gender);
        if (f.modelo) setModelo(f.modelo);
        if (f.status) setStatus(f.status);
        if (f.onlyPromo) setOnlyPromo(true);
        if (f.onlyOut) setOnlyOut(true);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    try {
      localStorage.setItem("gg-admin-filter", JSON.stringify({ team, q, cat, gender, modelo, status, onlyPromo, onlyOut }));
    } catch {}
  }, [team, q, cat, gender, modelo, status, onlyPromo, onlyOut]);

  // times agrupados por coleção; a Europa é subdividida por liga
  // (La Liga, Serie A, Premier League, Bundesliga, Ligue One)
  const teamGroups = useMemo<TeamGroup[]>(() => {
    const GRP: Record<string, string> = { brasileirao: "Brasileirão", europa: "Europa", selecoes: "Seleções" };
    const primary = new Map<string, string>(); // time -> categoria base
    const allTeams = new Set<string>();
    for (const r of items) {
      const t = r.team?.trim();
      if (!t) continue;
      allTeams.add(t);
      const g = GRP[r.category];
      if (g && !primary.has(t)) primary.set(t, g);
    }
    const buckets: Record<string, string[]> = {};
    const put = (label: string, t: string) => (buckets[label] ??= []).push(t);
    for (const t of allTeams) {
      const base = primary.get(t) ?? "Outros";
      if (base === "Europa") put(leagueOfTeam(t) ?? "Europa (outros)", t);
      else put(base, t);
    }
    const order = ["Brasileirão", "La Liga", "Serie A", "Premier League", "Bundesliga", "Ligue One", "Europa (outros)", "Seleções", "Outros"];
    return order
      .filter((label) => buckets[label]?.length)
      .map((label) => ({ label, teams: buckets[label].sort((a, b) => a.localeCompare(b, "pt-BR")) }));
  }, [items]);

  // facetas (contagem por coleção/gênero/modelo) sobre todos os itens
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of items) m.set(r.category, (m.get(r.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);
  const modelos = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of items) { const t = modeloOf(r.name); if (t) m.set(t, (m.get(t) ?? 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return items.filter((r) => {
      if (team && (r.team ?? "") !== team) return false;
      if (cat && r.category !== cat) return false;
      if (gender && genderOf(r.name) !== gender) return false;
      if (modelo && modeloOf(r.name) !== modelo) return false;
      if (status === "active" && !r.active) return false;
      if (status === "inactive" && r.active) return false;
      if (onlyPromo && !r.promo3x2) return false;
      if (onlyOut && r.inStock) return false;
      if (nq && !norm(r.name).includes(nq) && !norm(r.team ?? "").includes(nq)) return false;
      return true;
    });
  }, [items, team, q, cat, gender, modelo, status, onlyPromo, onlyOut]);

  const hasFilter = !!(team || q || cat || gender || modelo || status || onlyPromo || onlyOut);
  const clearAll = () => { setTeam(""); setQ(""); setCat(""); setGender(""); setModelo(""); setStatus(""); setOnlyPromo(false); setOnlyOut(false); };

  // atualiza um campo booleano no banco + localmente (sem recarregar a página)
  async function patch(id: string, field: "active" | "inStock" | "promo3x2", value: boolean) {
    setBusy(id);
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch {
      // reverte em caso de falha
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: !value } : r)));
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    setBusy(id);
    const snapshot = items;
    setItems((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) setItems(snapshot); // reverte
    } catch {
      setItems(snapshot);
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return <div className="cart-empty"><h2>Nenhum produto ainda</h2><p>Clique em “Novo produto” para cadastrar o primeiro.</p></div>;
  }

  return (
    <div className="adm-layout">
      <button className="adm-side-toggle" onClick={() => setSideOpen((v) => !v)}>
        <SlidersHorizontal size={16} /> Filtros{hasFilter ? " (ativos)" : ""}
      </button>

      <aside className={`adm-side${sideOpen ? " open" : ""}`}>
        <div className="adm-search">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou time…" />
        </div>

        <div className="adm-side-group">
          <label className="adm-side-lbl">Time</label>
          <TeamCombo groups={teamGroups} value={team} total={items.length} onChange={setTeam} />
        </div>

        <div className="adm-side-group">
          <label className="adm-side-lbl">Coleção</label>
          <div className="adm-chips">
            <button className={`adm-chip${!cat ? " on" : ""}`} onClick={() => setCat("")}>Todas</button>
            {catCounts.map(([c, n]) => (
              <button key={c} className={`adm-chip${cat === c ? " on" : ""}`} onClick={() => setCat(cat === c ? "" : c)}>
                {catLabel(c)} <span>{n}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="adm-side-group">
          <label className="adm-side-lbl">Gênero</label>
          <div className="adm-chips">
            <button className={`adm-chip${!gender ? " on" : ""}`} onClick={() => setGender("")}>Todos</button>
            <button className={`adm-chip${gender === "masculino" ? " on" : ""}`} onClick={() => setGender(gender === "masculino" ? "" : "masculino")}>Masculino</button>
            <button className={`adm-chip${gender === "feminina" ? " on" : ""}`} onClick={() => setGender(gender === "feminina" ? "" : "feminina")}>Feminino</button>
          </div>
        </div>

        {modelos.length > 0 && (
          <div className="adm-side-group">
            <label className="adm-side-lbl">Modelo</label>
            <div className="adm-chips">
              <button className={`adm-chip${!modelo ? " on" : ""}`} onClick={() => setModelo("")}>Todos</button>
              {modelos.map(([t, n]) => (
                <button key={t} className={`adm-chip${modelo === t ? " on" : ""}`} onClick={() => setModelo(modelo === t ? "" : t)}>
                  {t} <span>{n}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="adm-side-group">
          <label className="adm-side-lbl">Status</label>
          <div className="adm-chips">
            <button className={`adm-chip${!status ? " on" : ""}`} onClick={() => setStatus("")}>Todos</button>
            <button className={`adm-chip${status === "active" ? " on" : ""}`} onClick={() => setStatus(status === "active" ? "" : "active")}>Ativos</button>
            <button className={`adm-chip${status === "inactive" ? " on" : ""}`} onClick={() => setStatus(status === "inactive" ? "" : "inactive")}>Inativos</button>
          </div>
          <label className="adm-side-check">
            <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} /> Só na promoção 3×2
          </label>
          <label className="adm-side-check">
            <input type="checkbox" checked={onlyOut} onChange={(e) => setOnlyOut(e.target.checked)} /> Só esgotados
          </label>
        </div>

        {hasFilter && <button className="adm-filter-clear" onClick={clearAll}>Limpar filtros</button>}
      </aside>

      <div className="adm-main">
        <div className="adm-main-head">
          <span className="adm-filter-count">{filtered.length} de {items.length} {items.length === 1 ? "produto" : "produtos"}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="cart-empty"><h2>Nenhum produto para esse filtro</h2></div>
        ) : (
          <div className="apc-grid">
            {filtered.map((p) => (
            <div className={`apc${p.active ? "" : " off"}`} key={p.id}>
              <div className="apc-media">
                <CardMedia images={p.images} />
                <div className="apc-icons">
                  <a className="apc-icon" href={`/produto/${p.id}`} target="_blank" rel="noopener noreferrer" aria-label="Ver na loja" title="Ver na loja"><ExternalLink size={15} /></a>
                  <Link className="apc-icon" href={`/admin/produto/${p.id}`} aria-label="Editar" title="Editar"><Pencil size={15} /></Link>
                  <button className="apc-icon danger" onClick={() => del(p.id, p.name)} disabled={busy === p.id} aria-label="Excluir" title="Excluir"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="apc-body">
                <b className="apc-name">{p.name}</b>
                <span className="apc-sub">{[p.team, p.category].filter(Boolean).join(" · ")}</span>
                <b className="apc-price">{brl(p.priceCents / 100)}</b>

                <div className="apc-toggles">
                  <label className="adm-toggle" title={p.active ? "Ativo na loja" : "Oculto da loja"}>
                    <input type="checkbox" checked={p.active} disabled={busy === p.id} onChange={() => patch(p.id, "active", !p.active)} />
                    <span className={`adm-toggle-track${p.active ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">{p.active ? "Ativo" : "Inativo"}</span>
                  </label>
                  <label className="adm-toggle" title={p.inStock ? "Em estoque" : "Sem estoque (waitlist ativa)"}>
                    <input type="checkbox" checked={p.inStock} disabled={busy === p.id} onChange={() => patch(p.id, "inStock", !p.inStock)} />
                    <span className={`adm-toggle-track${p.inStock ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">{p.inStock ? "Estoque" : "Esgotado"}</span>
                  </label>
                  <label className="adm-toggle" title={p.promo3x2 ? "Na promoção Leve 3 Pague 2" : "Fora da promoção"}>
                    <input type="checkbox" checked={p.promo3x2} disabled={busy === p.id} onChange={() => patch(p.id, "promo3x2", !p.promo3x2)} />
                    <span className={`adm-toggle-track${p.promo3x2 ? " on" : ""}`}><span className="adm-toggle-dot" /></span>
                    <span className="adm-toggle-label">3x2</span>
                  </label>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
