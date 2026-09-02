"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useEffect } from "react";
import { Upload, Shirt, RotateCcw } from "lucide-react";
import type { Product } from "@/data/products";
import { Jersey } from "@/components/Jersey";

/**
 * Provador virtual (client-side): a pessoa envia uma foto e posiciona/redimensiona
 * a camisa por cima. Ponto de integração pronto para trocar por uma API de VTON
 * com IA no futuro (basta enviar a foto + o produto e receber a imagem gerada).
 */
export function ProvadorModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 46 }); // % no palco
  const [scale, setScale] = useState(55); // largura em % do palco
  const [opacity, setOpacity] = useState(0.92);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // libera a URL da foto ao trocar/desmontar
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (photo) URL.revokeObjectURL(photo);
      setPhoto(URL.createObjectURL(f));
    }
  };

  const moveTo = (clientX: number, clientY: number) => {
    const st = stageRef.current;
    if (!st) return;
    const r = st.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const reset = () => {
    setPos({ x: 50, y: 46 });
    setScale(55);
    setOpacity(0.92);
  };

  return (
    <div
      className={`prov-scrim${open ? " open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div className="prov" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Provador virtual">
        <button className="prov-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <h3>Provador virtual</h3>
        <p className="sub">Envie sua foto e ajuste a camisa por cima para simular o visual.</p>

        <div
          className="stage"
          ref={stageRef}
          onPointerMove={(e) => {
            if (dragging.current) moveTo(e.clientX, e.clientY);
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
        >
          {photo ? (
            <img className="photo" src={photo} alt="Sua foto" />
          ) : (
            <div className="ph">
              <Upload />
              Envie uma foto sua de frente
              <br />
              (de preferência da cintura pra cima)
            </div>
          )}

          <div
            className="overlay"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${scale}%`,
              transform: "translate(-50%,-50%)",
              opacity,
            }}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
          >
            <Jersey colors={product.colors} />
          </div>
        </div>

        <div className="controls">
          <div className="ctl">
            <label>Tamanho</label>
            <input
              type="range"
              min={25}
              max={95}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
          </div>
          <div className="ctl">
            <label>Opacidade</label>
            <input
              type="range"
              min={40}
              max={100}
              value={opacity * 100}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            />
          </div>

          <div className="prov-actions">
            <div className="file">
              <label htmlFor="prov-file">
                <Upload size={16} /> {photo ? "Trocar foto" : "Enviar foto"}
              </label>
              <input id="prov-file" type="file" accept="image/*" onChange={onFile} />
            </div>
            <button className="reset" onClick={reset} type="button">
              <RotateCcw size={16} /> Redefinir
            </button>
          </div>
        </div>

        <p className="disclaimer">
          <Shirt size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          Simulação aproximada — a camisa é posicionada sobre a sua foto. Sua imagem fica só no seu
          navegador, não é enviada para nenhum servidor.
        </p>
      </div>
    </div>
  );
}
