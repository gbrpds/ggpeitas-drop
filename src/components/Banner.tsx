import { ImageIcon } from "lucide-react";

/**
 * Espaço reservado para o banner principal. A arte definitiva entra depois
 * já na resolução indicada (sem texto sobreposto pelo código).
 */
export function Banner() {
  return (
    <section className="banner-sec">
      <div className="banner desk" role="img" aria-label="Espaço reservado para banner principal (desktop)">
        <div className="tag">
          <ImageIcon />
          <b>Banner principal · Desktop</b>
          <div className="res">1920 × 640 px</div>
          <span>JPG/PNG/WEBP · proporção 3:1</span>
        </div>
      </div>
      <div className="banner mob" role="img" aria-label="Espaço reservado para banner principal (mobile)">
        <div className="tag">
          <ImageIcon />
          <b>Banner principal · Mobile</b>
          <div className="res">1080 × 1350 px</div>
          <span>JPG/PNG/WEBP · proporção 4:5</span>
        </div>
      </div>
    </section>
  );
}
