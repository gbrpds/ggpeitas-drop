# GG Peitas

Loja de camisas de futebol importadas. E-commerce simples e focado em conversão.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** — estado global (carrinho + tema)
- **Framer Motion** — animações
- **Lucide React** — ícones

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:3000

Outros comandos:

```bash
npm run build   # build de produção
npm run start   # servir o build
```

## Estrutura

```
src/
  app/
    layout.tsx        # fontes, tema anti-flash, símbolo da camisa
    page.tsx          # home
    globals.css       # tokens de design + estilos dos componentes
  components/         # Header, MainNav, Banner, ProductCard, etc.
  data/
    products.ts       # produtos e categorias (mock — trocar por Neon)
    nav.ts            # itens do menu
  store/
    cart.ts           # carrinho (Zustand + persist)
    ui.ts             # drawer mobile + tema (claro/escuro)
  lib/
    format.ts         # formatação de preço em BRL
```

## Tema

Claro por padrão. O botão sol/lua alterna e salva a escolha no `localStorage`
(classe `gg-dark` no `<html>`). Não segue o tema do navegador.

## Deploy (Vercel)

1. Suba o repositório para o GitHub.
2. Em vercel.com → **Add New → Project** → importe o repo.
3. A Vercel detecta Next.js automaticamente. Deploy.

## Próximos passos

- **Banco de dados: Neon (Postgres serverless).** Os produtos hoje vêm de
  `src/data/products.ts` (mock) já no formato final. Ao plugar o Neon, criar o
  acesso a dados (ex.: Drizzle ou Prisma) e trocar a origem sem mexer na UI.
  A connection string vai em `DATABASE_URL` (env var na Vercel — nunca commitar).
- Página de produto (fotos, tamanhos, versão jogador/torcedor).
- Painel admin (upload das fotos do Yupoo → nome/time → categoria automática).
- Pagamento via Mercado Pago (reaproveitar integração anterior).
