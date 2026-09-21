import sharp from "sharp";
import fs from "node:fs";

const OUT = "scripts/ad-images";
fs.mkdirSync(OUT, { recursive: true });

const urls = [
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/Camisa_Flamengo_25_26_-_Home__Masculina_-hlz3s9uh.jpg",
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/yupoo-c1af1b3556-vi5zq7s4.jpg",
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/Camisa_Palmeiras_2024_25_-_Home__Masculino_-vljsa1ev.jpg",
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/Camisa_Barcelona_-_Home__Masculino_-llilf932.jpg",
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/Camisa_Corinthians_24_25_-_Home__Masculino_-8q9gvgk0.jpg",
  "https://pub-1b77c04e92884f3f8ff886063aa711d2.r2.dev/produtos/Camisa_Atl_tico-MG_24_25__Masculino_-47g416w0.jpg",
];

const bufs = [];
for (const u of urls) bufs.push(Buffer.from(await (await fetch(u)).arrayBuffer()));

const grad = (w, h) => Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs>
  <radialGradient id="g" cx="50%" cy="42%" r="80%">
    <stop offset="0%" stop-color="#15391f"/><stop offset="70%" stop-color="#0d0d0d"/><stop offset="100%" stop-color="#0a0a0a"/>
  </radialGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`);

// card branco arredondado com a camisa (contain)
async function card(buf, W, H) {
  const pad = Math.round(W * 0.06);
  const jersey = await sharp(buf).resize(W - pad * 2, H - pad * 2, { fit: "contain", background: "#ffffff" }).toBuffer();
  const base = await sharp({ create: { width: W, height: H, channels: 4, background: "#ffffff" } })
    .composite([{ input: jersey, gravity: "center" }]).png().toBuffer();
  const r = Math.round(W * 0.06);
  const mask = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
  return sharp(base).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

async function logoBuf(w) {
  const h = Math.round((w * 546) / 457);
  return { buf: await sharp("public/logo.png").resize(w, h, { fit: "inside" }).png().toBuffer(), w, h };
}

async function build(name, W, H, cols, rows, idxs, logoW) {
  const gap = Math.round(W * 0.02);
  const topPad = Math.round(H * 0.14); // espaço pro logo
  const cellW = Math.floor((W - gap * (cols + 1)) / cols);
  const cellH = Math.floor((H - topPad - gap * (rows + 1)) / rows);
  const comp = [];
  for (let i = 0; i < idxs.length; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    comp.push({ input: await card(bufs[idxs[i]], cellW, cellH), left: gap + c * (cellW + gap), top: topPad + gap + r * (cellH + gap) });
  }
  const lg = await logoBuf(logoW);
  comp.push({ input: lg.buf, top: Math.round((topPad - lg.h) / 2) + gap, left: Math.round((W - lg.w) / 2) });
  await sharp(grad(W, H)).composite(comp).jpeg({ quality: 86 }).toFile(`${OUT}/${name}.jpg`);
  console.log(`ok ${name}.jpg (${W}x${H})`);
}

// Quadrada 1200x1200 (2x2) e horizontal 1200x628 (1x4, limpa) de backup
await build("anuncio-quadrado", 1200, 1200, 2, 2, [0, 1, 2, 3], 150);
await build("anuncio-horizontal", 1200, 628, 4, 1, [0, 1, 2, 3], 120);
