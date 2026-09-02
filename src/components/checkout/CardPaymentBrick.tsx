"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

/**
 * Renderiza o formulário de cartão do Mercado Pago (Bricks), que tokeniza o
 * cartão no cliente (PCI) e devolve o token no onSubmit para processarmos.
 */
export function CardPaymentBrick({
  amount,
  onPay,
}: {
  amount: number;
  onPay: (formData: any) => Promise<void>;
}) {
  const initted = useRef(false);

  useEffect(() => {
    if (initted.current) return;
    const pk = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!pk) return;
    initted.current = true;

    const start = () => {
      if (!window.MercadoPago) return;
      const mp = new window.MercadoPago(pk, { locale: "pt-BR" });
      mp.bricks()
        .create("cardPayment", "cardPaymentBrick_container", {
          initialization: { amount },
          customization: { paymentMethods: { maxInstallments: 12 } },
          callbacks: {
            onReady: () => {},
            onSubmit: (formData: any) => onPay(formData),
            onError: (e: any) => console.error("MP Brick error", e),
          },
        })
        .catch((e: any) => console.error("MP Brick create error", e));
    };

    if (window.MercadoPago) {
      start();
    } else {
      const s = document.createElement("script");
      s.src = "https://sdk.mercadopago.com/js/v2";
      s.async = true;
      s.onload = start;
      document.body.appendChild(s);
    }
  }, [amount, onPay]);

  return <div id="cardPaymentBrick_container" />;
}
