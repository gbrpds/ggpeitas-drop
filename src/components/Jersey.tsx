import type { CSSProperties } from "react";
import type { JerseyColors } from "@/data/products";

/** Definição única do símbolo da camisa (renderizada uma vez no layout). */
export function JerseySymbol() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="jersey" viewBox="0 0 100 108">
        <path
          d="M36,10 C41,18 59,18 64,10 L82,17 L94,42 L78,51 L72,41 L72,98 L28,98 L28,41 L22,51 L6,42 L18,17 Z"
          fill="var(--j1,#0f8a3d)"
        />
        <path d="M36,10 C41,18 59,18 64,10 L60,12 C55,17 45,17 40,12 Z" fill="var(--j2,#ffc400)" />
        <path d="M72,41 L72,52 L78,49 L74,41 Z M28,41 L28,52 L22,49 L26,41 Z" fill="var(--j2,#ffc400)" />
        <rect x="45" y="30" width="10" height="12" rx="2" fill="var(--j3,#ffffff)" opacity=".92" />
      </symbol>
    </svg>
  );
}

/** Instância recolorida da camisa. */
export function Jersey({ colors }: { colors: JerseyColors }) {
  const style = {
    "--j1": colors[0],
    "--j2": colors[1],
    "--j3": colors[2],
  } as CSSProperties;
  return (
    <svg className="jersey" style={style} aria-hidden="true">
      <use href="#jersey" />
    </svg>
  );
}
