"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Copy, Check, QrCode as QrIcon } from "lucide-react";

export function PixDisplay({ qrCode, qrCodeBase64 }: { qrCode?: string; qrCodeBase64?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pix-box">
      <div className="pix-card">
        <div className="pix-card-badge"><QrIcon size={15} /> Pagamento via PIX</div>
        <h3>Escaneie o QR Code para pagar</h3>
        {qrCodeBase64 && (
          <img className="pix-qr" src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" />
        )}
        <p className="pix-label">Ou copie o código PIX (copia e cola):</p>
        <div className="pix-code">
          <input readOnly value={qrCode ?? ""} onFocus={(e) => e.target.select()} />
          <button
            onClick={() => {
              if (qrCode) {
                navigator.clipboard.writeText(qrCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }
            }}
            aria-label="Copiar código PIX"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
      <p className="pix-note">
        Assim que o pagamento for identificado, seu pedido é confirmado automaticamente — pode fechar esta página.
      </p>
    </div>
  );
}
