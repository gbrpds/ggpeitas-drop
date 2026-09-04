"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Loader2, Save } from "lucide-react";

export const CATEGORIES = [
  { value: "futebol", label: "Futebol" },
  { value: "selecoes", label: "Seleções" },
  { value: "feminina", label: "Feminina" },
  { value: "infantil", label: "Conjunto Infantil" },
  { value: "retro", label: "Retrô" },
  { value: "brasileirao", label: "Brasileirão" },
  { value: "europa", label: "Europa" },
];

export type ProductInitial = {
  name: string;
  team: string | null;
  category: string;
  priceCents: number;
  compareCents: number | null;
  version: string | null;
  images: string[];
  active: boolean;
  inStock: boolean;
  promo3x2: boolean;
};

const centsToStr = (c?: number | null) => (c ? (c / 100).toFixed(2).replace(".", ",") : "");

export function AdminProductForm({ id, initial }: { id?: string; initial?: ProductInitial }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [category, setCategory] = useState(initial?.category ?? "futebol");
  const [price, setPrice] = useState(centsToStr(initial?.priceCents));
  const [compare, setCompare] = useState(centsToStr(initial?.compareCents));
  const version = "Torcedor"; // único modelo
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [active, setActive] = useState(initial?.active ?? true);
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [promo3x2, setPromo3x2] = useState(initial?.promo3x2 ?? false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reais = (v: string) => Math.round(parseFloat(v.replace(",", ".")) * 100);
  const isEdit = !!id;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError(null);
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Falha no upload.");
          break;
        }
        setImages((prev) => [...prev, data.url]);
      }
    } catch {
      setError("Falha de conexão no upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    setError(null);
    if (name.trim().length < 2) return setError("Informe o nome do produto.");
    const priceCents = reais(price);
    if (!priceCents || priceCents <= 0) return setError("Informe um preço válido.");
    const compareCents = compare ? reais(compare) : null;

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          team: team.trim() || null,
          category,
          priceCents,
          compareCents,
          version: version || null,
          images,
          active,
          inStock,
          promo3x2,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Falha de conexão.");
      setSaving(false);
    }
  }

  return (
    <div className="adm-form">
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="co-field">
        <label>Fotos do produto</label>
        <div className="adm-uploads">
          {images.map((url) => (
            <div className="adm-thumb" key={url}>
              <img src={url} alt="" />
              <button onClick={() => setImages((p) => p.filter((u) => u !== url))} aria-label="Remover"><X size={14} /></button>
            </div>
          ))}
          <label className="adm-upload-btn">
            {uploading ? <Loader2 size={20} className="spin" /> : <UploadCloud size={22} />}
            <span>{uploading ? "Enviando…" : "Adicionar"}</span>
            <input type="file" accept="image/*" multiple onChange={onFiles} hidden />
          </label>
        </div>
      </div>

      <div className="co-field">
        <label>Nome do produto</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Camisa Flamengo 25/26 Home" />
      </div>

      <div className="co-row">
        <div className="co-field">
          <label>Time / Seleção</label>
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Ex: Flamengo" />
        </div>
        <div className="co-field">
          <label>Categoria (tag)</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="adm-select">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="co-row">
        <div className="co-field">
          <label>Preço (R$)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="189,90" inputMode="decimal" />
        </div>
        <div className="co-field">
          <label>Preço &quot;de&quot; — riscado (opcional)</label>
          <input value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="269,00" inputMode="decimal" />
        </div>
      </div>

      <div className="co-field adm-active">
        <label>Publicar na loja</label>
        <label className="adm-switch">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>{active ? "Ativo" : "Inativo"}</span>
        </label>
      </div>

      <div className="co-field adm-active">
        <label>Estoque</label>
        <label className="adm-switch">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <span>{inStock ? "Em estoque" : "Sem estoque (avise-me quando voltar)"}</span>
        </label>
      </div>

      <div className="co-field adm-active">
        <label>Promoção “Leve 3, Pague 2”</label>
        <label className="adm-switch">
          <input type="checkbox" checked={promo3x2} onChange={(e) => setPromo3x2(e.target.checked)} />
          <span>{promo3x2 ? "Participa da promoção" : "Fora da promoção"}</span>
        </label>
      </div>

      <button className="co-next" onClick={save} disabled={saving || uploading}>
        {saving ? <Loader2 size={18} className="spin" /> : <><Save size={18} /> {isEdit ? "Salvar alterações" : "Salvar produto"}</>}
      </button>
    </div>
  );
}
