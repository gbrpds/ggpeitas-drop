/**
 * Animação "voar para o carrinho": clona a imagem do produto e a desloca
 * até o ícone do carrinho no header, terminando com um "pulo" no ícone.
 * É puramente visual e não bloqueia nada; respeita prefers-reduced-motion.
 */
export function flyToCart(sourceEl: HTMLElement | null, imageUrl?: string | null) {
  if (typeof window === "undefined" || !sourceEl) return;

  const target = document.querySelector<HTMLElement>("[data-cart-icon]");
  if (!target) return;

  const bump = () => {
    target.classList.remove("cart-bump");
    void target.offsetWidth; // reinicia a animação
    target.classList.add("cart-bump");
    setTimeout(() => target.classList.remove("cart-bump"), 500);
  };

  // sem animação para quem prefere menos movimento — só o "pulo" do ícone
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    bump();
    return;
  }

  const s = sourceEl.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const size = Math.min(96, Math.max(56, s.width * 0.5));

  const fly = document.createElement("div");
  fly.className = "fly-to-cart";
  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "";
    fly.appendChild(img);
  }
  fly.style.left = `${s.left + s.width / 2 - size / 2}px`;
  fly.style.top = `${s.top + s.height / 2 - size / 2}px`;
  fly.style.width = `${size}px`;
  fly.style.height = `${size}px`;
  document.body.appendChild(fly);

  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);

  requestAnimationFrame(() => {
    fly.style.transform = `translate(${dx}px, ${dy}px) scale(0.12) rotate(8deg)`;
    fly.style.opacity = "0.2";
  });

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    fly.remove();
    bump();
  };
  fly.addEventListener("transitionend", cleanup, { once: true });
  setTimeout(cleanup, 1100); // garantia caso o transitionend não dispare
}
