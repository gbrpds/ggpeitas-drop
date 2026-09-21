import sharp from "sharp";
import fs from "node:fs";

const OUT = "scripts/banner-email";
fs.mkdirSync(OUT, { recursive: true });

// fade radial igual ao do e-mail: circle at 50% 45%, #15271c -> #0d0d0d
const grad = (w, h) => Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#15271c"/>
      <stop offset="72%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#0b0b0b"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
</svg>`);

async function make(name, W, H, logoW) {
  const logoH = Math.round((logoW * 546) / 457);
  const logo = await sharp("public/logo.png").resize(logoW, logoH, { fit: "inside" }).png().toBuffer();
  await sharp(grad(W, H))
    .composite([{ input: logo, top: Math.round((H - logoH) / 2), left: Math.round((W - logoW) / 2) }])
    .png()
    .toFile(`${OUT}/${name}.png`);
  console.log(`ok ${name}.png (${W}x${H})`);
}

await make("banner-email-16x9", 1200, 675, 330);
await make("banner-email-quadrado", 1080, 1080, 440);
await make("banner-email-largo", 1600, 600, 300);
