"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";
import { Send, ImagePlus, CheckCircle2, X, Loader2 } from "lucide-react";

export function RequestForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState(defaultQuery ? `Procuro: ${defaultQuery}` : "");
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setPreview(null);
    if (f.size > 8 * 1024 * 1024) { setError("Foto muito grande (máx. 8 MB)."); e.target.value = ""; return; }
    setError(null);
    setPreview(URL.createObjectURL(f));
  }
  function clearPhoto() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!contact.trim()) return setError("Informe um contato (WhatsApp ou e-mail).");
    if (description.trim().length < 3) return setError("Descreva a camisa que procura.");
    setSending(true);
    try {
      const fd = new FormData();
      fd.set("name", name.trim());
      fd.set("contact", contact.trim());
      fd.set("query", defaultQuery);
      fd.set("description", description.trim());
      const f = fileRef.current?.files?.[0];
      if (f) fd.set("photo", f);
      const res = await fetch("/api/requests", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error ?? "Não foi possível enviar. Tente novamente."); return; }
      setDone(true);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="cart-empty">
        <CheckCircle2 strokeWidth={1.5} />
        <h2>Solicitação enviada! 🎉</h2>
        <p>Recebemos seu pedido e vamos te chamar no contato informado assim que localizarmos a camisa.</p>
        <Link className="btn btn-g" href="/">Voltar à loja</Link>
      </div>
    );
  }

  return (
    <form className="req-form" onSubmit={submit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="co-field">
        <label>Seu nome <span className="req-opt">(opcional)</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar" />
      </div>

      <div className="co-field">
        <label>Contato — WhatsApp ou e-mail</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="(11) 90000-0000 ou voce@email.com" />
        <span className="co-hint">É por aqui que a gente te responde.</span>
      </div>

      <div className="co-field">
        <label>Qual camisa você procura?</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Camisa retrô do Flamengo 1981, tamanho G, com patch da Libertadores…" />
      </div>

      <div className="co-field">
        <label>Foto de referência <span className="req-opt">(opcional)</span></label>
        {preview ? (
          <div className="req-photo">
            <img src={preview} alt="Prévia" />
            <button type="button" className="req-photo-x" onClick={clearPhoto} aria-label="Remover foto"><X size={16} /></button>
          </div>
        ) : (
          <button type="button" className="req-photo-add" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={18} /> Anexar foto do produto
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
      </div>

      <button className="btn btn-g req-submit" disabled={sending}>
        {sending ? <><Loader2 size={18} className="spin" /> Enviando…</> : <><Send size={17} /> Enviar solicitação</>}
      </button>
    </form>
  );
}
