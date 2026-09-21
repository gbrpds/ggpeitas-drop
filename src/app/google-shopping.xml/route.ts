import { getAllActive } from "@/lib/catalog";
import { baseUrl } from "@/lib/site-url";

// Feed de produtos para o Google Merchant Center (listagens grátis do Google
// Shopping e base para campanhas). Padrão RSS 2.0 com namespace g:.
// URL: https://<site>/google-shopping.xml
export const revalidate = 3600; // atualiza de hora em hora

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const CAT_PT: Record<string, string> = {
  brasileirao: "Brasileirão",
  europa: "Europa",
  selecoes: "Seleções",
  retro: "Retrô",
  mundo: "Mundo",
  feminina: "Feminina",
  infantil: "Conjuntos Esportivos",
};

export async function GET() {
  const site = baseUrl();
  const all = await getAllActive();
  const items = all.filter((p) => (p.images?.length ?? 0) > 0 && p.now > 0);

  const body = items
    .map((p) => {
      const link = `${site}/produto/${p.id}`;
      const img = p.images![0];
      const extra = (p.images ?? []).slice(1, 11).map((u) => `\n    <g:additional_image_link>${esc(u)}</g:additional_image_link>`).join("");
      const priceReg = (p.was && p.was > p.now ? p.was : p.now).toFixed(2);
      const salePrice = p.was && p.was > p.now ? `\n    <g:sale_price>${p.now.toFixed(2)} BRL</g:sale_price>` : "";
      const avail = p.inStock === false ? "out_of_stock" : "in_stock";
      const desc = `${p.name} — camisa de futebol importada premium (qualidade tailandesa 1:1)${p.team ? `, ${p.team}` : ""}. Frete para todo o Brasil e até 3x sem juros.`;
      const productType = CAT_PT[p.category] ?? p.category;
      return `  <item>
    <g:id>${esc(p.id)}</g:id>
    <g:title>${esc(p.name.slice(0, 150))}</g:title>
    <g:description>${esc(desc.slice(0, 4900))}</g:description>
    <g:link>${esc(link)}</g:link>
    <g:image_link>${esc(img)}</g:image_link>${extra}
    <g:availability>${avail}</g:availability>
    <g:price>${priceReg} BRL</g:price>${salePrice}
    <g:condition>new</g:condition>
    <g:brand>GG Peitas</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
    <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Activewear</g:google_product_category>
    <g:product_type>${esc(productType)}</g:product_type>
    <g:mpn>${esc(p.id)}</g:mpn>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>GG Peitas — Camisas de Futebol</title>
  <link>${esc(site)}</link>
  <description>Camisas de futebol importadas premium: Brasileirão, Europa, Seleções, Retrôs e mais.</description>
${body}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
