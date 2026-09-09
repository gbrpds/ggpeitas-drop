import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GG Peitas — Camisas de Futebol";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggpeitas.com.br";

/** Prévia de link (WhatsApp/redes): logo da GG Peitas centralizado no fundo preto. */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          backgroundImage: "radial-gradient(circle at 50% 45%, #15271c 0%, #0d0d0d 65%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${SITE_URL}/logo.png`} alt="" style={{ width: 372, height: 444 }} />
      </div>
    ),
    { ...size },
  );
}
