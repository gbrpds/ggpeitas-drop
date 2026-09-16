/** Injeta dados estruturados (schema.org) para rich results no Google. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // conteúdo controlado por nós (não é input de usuário)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
