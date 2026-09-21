import Script from "next/script";

/** Carrega a tag do Google Ads (gtag) se NEXT_PUBLIC_GADS_ID estiver definido.
 *  Sem a variável, não renderiza nada (no-op). */
export function GoogleAds() {
  const id = process.env.NEXT_PUBLIC_GADS_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="gads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
