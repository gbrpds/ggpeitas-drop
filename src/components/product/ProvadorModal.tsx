"use client";

import { useState } from "react";
import { Ruler, Check } from "lucide-react";
import { SIZES } from "@/lib/product";

type Gender = "homem" | "mulher";
type Body = "magro" | "atletico" | "robusto";

/** Ícones de tipo de corpo (torso estilizado). */
function BodyIcon({ variant }: { variant: Body }) {
  const shapes: Record<Body, string> = {
    // magro: ombros estreitos, tronco reto
    magro: "M18 8h12l2 10-3 2v22h-10V20l-3-2z",
    // atlético: ombros largos, cintura afinada (V)
    atletico: "M12 8h24l3 11-5 3-2 6 2 14H12l2-14-2-6-5-3z",
    // robusto: barriga arredondada
    robusto: "M16 8h16l3 10-2 4c2 3 3 7 3 12 0 6-4 8-12 8s-12-2-12-8c0-5 1-9 3-12l-2-4z",
  };
  return (
    <svg viewBox="0 0 48 52" aria-hidden="true">
      <circle cx="24" cy="6" r="5" fill="currentColor" />
      <path d={shapes[variant]} fill="currentColor" />
    </svg>
  );
}

const BODIES: { id: Body; label: string }[] = [
  { id: "magro", label: "Magro" },
  { id: "atletico", label: "Atlético" },
  { id: "robusto", label: "Robusto" },
];

/** Recomenda um tamanho a partir de peso, altura e tipo de corpo. */
function recomendar(gender: Gender, pesoKg: number, alturaCm: number, body: Body): string {
  const h = alturaCm / 100;
  const imc = pesoKg > 0 && h > 0 ? pesoKg / (h * h) : 0;
  // índice base pela faixa de IMC
  let idx = 1; // M
  if (imc > 0) {
    if (imc < 19) idx = 0; // P
    else if (imc < 23) idx = 1; // M
    else if (imc < 27) idx = 2; // G
    else if (imc < 31) idx = 3; // GG
    else idx = 4; // XGG
  }
  // ajuste pelo tipo de corpo
  if (body === "robusto") idx += 1;
  if (body === "magro") idx -= 1;
  // mulheres costumam vestir um número abaixo na modelagem masculina
  if (gender === "mulher") idx -= 1;
  idx = Math.max(0, Math.min(SIZES.length - 1, idx));
  return SIZES[idx];
}

export function ProvadorModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick?: (size: string) => void;
}) {
  const [gender, setGender] = useState<Gender>("homem");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [body, setBody] = useState<Body | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const pode = Number(peso) > 0 && Number(altura) > 0 && !!body;

  const calcular = () => {
    if (!pode || !body) return;
    setResult(recomendar(gender, Number(peso), Number(altura), body));
  };

  const usar = () => {
    if (result && onPick) onPick(result);
    onClose();
  };

  return (
    <div className={`prov-scrim${open ? " open" : ""}`} onClick={onClose} aria-hidden={!open}>
      <div className="prov" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Provador virtual">
        <button className="prov-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <h3>Descubra seu tamanho</h3>
        <p className="sub">Responda rapidinho e a gente recomenda o tamanho ideal pra você.</p>

        {/* Sexo */}
        <div className="prov-field">
          <label>Você é</label>
          <div className="seg">
            <button className={gender === "homem" ? "on" : ""} onClick={() => setGender("homem")}>
              Homem
            </button>
            <button className={gender === "mulher" ? "on" : ""} onClick={() => setGender("mulher")}>
              Mulher
            </button>
          </div>
        </div>

        {/* Peso e altura */}
        <div className="prov-row">
          <div className="prov-field">
            <label htmlFor="prov-peso">Peso (kg)</label>
            <input
              id="prov-peso"
              type="number"
              inputMode="numeric"
              placeholder="Ex: 78"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>
          <div className="prov-field">
            <label htmlFor="prov-altura">Altura (cm)</label>
            <input
              id="prov-altura"
              type="number"
              inputMode="numeric"
              placeholder="Ex: 178"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
          </div>
        </div>

        {/* Tipo de corpo */}
        <div className="prov-field">
          <label>Tipo de corpo</label>
          <div className="body-opts">
            {BODIES.map((b) => (
              <button
                key={b.id}
                className={`body-opt${body === b.id ? " on" : ""}`}
                onClick={() => setBody(b.id)}
              >
                <BodyIcon variant={b.id} />
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="prov-primary" onClick={calcular} disabled={!pode}>
          <Ruler size={17} strokeWidth={2} /> Ver meu tamanho
        </button>

        {result && (
          <div className="prov-result">
            <div className="rsize">{result}</div>
            <div className="rtext">
              Seu tamanho recomendado é <b>{result}</b>. Prefere mais folgado? Vá um número acima.
            </div>
            {onPick && (
              <button className="prov-use" onClick={usar}>
                <Check size={16} strokeWidth={2.5} /> Usar tamanho {result}
              </button>
            )}
          </div>
        )}

        <p className="disclaimer">
          A recomendação é uma estimativa baseada nos seus dados — os tamanhos podem variar um pouco
          conforme a modelagem da camisa.
        </p>
      </div>
    </div>
  );
}
