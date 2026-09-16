import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const url = baseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // páginas privadas/transacionais não precisam ser indexadas
      disallow: ["/admin", "/api", "/conta", "/checkout", "/pedido", "/nova-senha", "/recuperar-senha"],
    },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
