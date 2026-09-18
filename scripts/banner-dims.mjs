import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const files = ["public/banner1-desktop.png", "public/banner1-mobile.png"];
const ligas = "public/ligas";
if (fs.existsSync(ligas)) for (const f of fs.readdirSync(ligas)) files.push(path.join(ligas, f));
for (const f of files) {
  try {
    const m = await sharp(f).metadata();
    const kb = (fs.statSync(f).size / 1024).toFixed(0);
    const disp = f.replace(/\\/g, "/").replace("public/", "/");
    console.log(`${disp}  ->  ${m.width}x${m.height}  (${(m.width / m.height).toFixed(2)}:1, ${kb}KB)`);
  } catch (e) {
    console.log(`${f}  ?  ${e.message}`);
  }
}
