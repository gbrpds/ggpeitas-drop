/* eslint-disable @next/next/no-img-element */

/** Banner principal da home (arte definitiva). */
export function Banner() {
  return (
    <section className="banner-sec">
      <div className="banner desk">
        <img src="/banner1-desktop.png" alt="GG Peitas — camisas de futebol" fetchPriority="high" />
      </div>
      <div className="banner mob">
        <img src="/banner1-mobile.png" alt="GG Peitas — camisas de futebol" fetchPriority="high" />
      </div>
    </section>
  );
}
