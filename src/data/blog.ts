/** Artigos do blog (SEO). Conteúdo autoral — HTML confiável (não é input de usuário). */
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMin: number;
  tag: string;
  body: string; // HTML
};

export const blogPosts: BlogPost[] = [
  {
    slug: "camisas-importadas-vale-a-pena",
    title: "Camisas de futebol importadas: vale a pena? Guia completo",
    description:
      "Entenda o que são as camisas de futebol importadas, a diferença entre as versões e por que valem a pena — qualidade, preço e como comprar com segurança.",
    date: "2026-09-01",
    readMin: 5,
    tag: "Guia",
    body: `
<p>As <strong>camisas de futebol importadas</strong> conquistaram o torcedor brasileiro por um motivo simples: entregam o visual e a pegada das oficiais por uma fração do preço. Mas ainda gera dúvida — vale a pena? Neste guia a gente explica tudo.</p>
<h2>O que são camisas importadas?</h2>
<p>São réplicas de alta qualidade produzidas no exterior (o padrão mais conhecido é a chamada <strong>qualidade tailandesa 1:1</strong>), com tecido, escudo bordado e detalhes muito próximos da peça oficial. Cobrem clubes e seleções do mundo todo, em versões atuais e <strong>retrô</strong>.</p>
<h2>Por que valem a pena</h2>
<ul>
  <li><strong>Preço justo:</strong> você paga bem menos que numa loja oficial.</li>
  <li><strong>Variedade:</strong> times e temporadas que muitas vezes nem chegam ao Brasil.</li>
  <li><strong>Qualidade:</strong> as versões 1:1 têm acabamento excelente, difícil de distinguir da oficial.</li>
</ul>
<h2>Como comprar com segurança</h2>
<p>Prefira lojas com fotos reais do produto, canais de atendimento ativos e política clara de troca. Na <strong>GG Peitas</strong> você encontra <a href="/categoria/brasileirao">camisas do Brasileirão</a>, <a href="/categoria/europa">clubes europeus</a>, <a href="/categoria/selecoes">seleções</a> e <a href="/categoria/retro">retrôs</a> — com frete grátis acima de R$299 e até 3x sem juros.</p>
<p>Não achou o modelo? A gente busca pra você: é só <a href="/solicitar">fazer uma solicitação</a>.</p>
`,
  },
  {
    slug: "como-identificar-camisa-tailandesa-1-1",
    title: "Como identificar uma camisa tailandesa 1:1 de qualidade",
    description:
      "Aprenda a reconhecer uma boa camisa tailandesa 1:1: escudo bordado, tecido, costuras, etiquetas e detalhes que separam a versão premium das ruins.",
    date: "2026-09-05",
    readMin: 6,
    tag: "Dicas",
    body: `
<p>Nem toda réplica é igual. A <strong>camisa tailandesa 1:1</strong> é o topo das importadas — feita para ficar o mais próximo possível da oficial. Veja como reconhecer a qualidade de verdade.</p>
<h2>1. Escudo e patrocínios</h2>
<p>Nas versões premium, o escudo é <strong>bordado</strong> (não estampado) e os patrocínios têm impressão nítida, sem borrar. Bordas irregulares são sinal de peça inferior.</p>
<h2>2. Tecido e caimento</h2>
<p>O tecido é <strong>dry-fit</strong>, leve e respirável, com a textura correta do modelo. Caimento certinho no corpo, sem parecer "camisa de algodão".</p>
<h2>3. Costuras e acabamento</h2>
<p>Costuras retas e reforçadas, gola bem-feita e etiquetas internas alinhadas. Detalhes como listras e golas devem bater com a foto oficial.</p>
<h2>4. Tamanho</h2>
<p>As importadas costumam vestir um pouco mais justo. Sempre confira a <a href="/">tabela de medidas</a> antes de comprar — na dúvida, suba um tamanho.</p>
<p>Na <strong>GG Peitas</strong> trabalhamos com o padrão 1:1 e mostramos fotos reais de cada modelo. Confira as <a href="/promocao">camisas em promoção</a> ou explore por <a href="/categoria/europa">liga e time</a>.</p>
`,
  },
  {
    slug: "camisas-retro-mais-iconicas",
    title: "Camisas retrô: as mais icônicas do futebol",
    description:
      "Um passeio pelas camisas retrô mais lendárias — Brasil, Flamengo, clubes europeus — e por que elas voltaram a ser desejo de todo torcedor.",
    date: "2026-09-10",
    readMin: 4,
    tag: "Retrô",
    body: `
<p>As <strong>camisas retrô</strong> viraram febre — e não é à toa. Elas carregam história, títulos e a nostalgia de gerações. Reunimos algumas das mais icônicas.</p>
<h2>Seleção Brasileira</h2>
<p>Das conquistas de Copa às camisas dos anos 90 e 2000, a amarelinha retrô é objeto de desejo. Veja as opções em <a href="/categoria/selecoes">Seleções</a>.</p>
<h2>Clubes brasileiros</h2>
<p>Flamengo, Palmeiras, Corinthians, Grêmio, Cruzeiro… os mantos clássicos dos grandes do <a href="/categoria/brasileirao">Brasileirão</a> nunca saem de moda.</p>
<h2>Gigantes europeus</h2>
<p>Real Madrid, Barcelona, Milan, Manchester United — as retrôs dos <a href="/categoria/europa">gigantes europeus</a> resgatam eras douradas do futebol mundial.</p>
<p>Explore a coleção completa de <a href="/categoria/retro">camisas retrô</a> na GG Peitas e vista uma lenda.</p>
`,
  },
  {
    slug: "tamanho-camisa-importada-como-escolher",
    title: "Tamanho de camisa importada: como escolher o ideal",
    description:
      "Guia de tamanhos das camisas importadas (P ao 2XG): como medir, dicas de caimento e quando subir um tamanho para acertar de primeira.",
    date: "2026-09-14",
    readMin: 4,
    tag: "Guia",
    body: `
<p>Errar o tamanho é a maior dor de quem compra <strong>camisa importada</strong> pela primeira vez. Com algumas dicas simples você acerta de primeira.</p>
<h2>Como medir</h2>
<p>Pegue uma camisa que você já usa e goste do caimento. Meça a <strong>largura</strong> (de uma axila à outra) e o <strong>comprimento</strong> (do ombro à barra). Compare com a tabela de medidas do produto.</p>
<h2>Caimento das importadas</h2>
<p>Elas tendem a vestir um pouco mais <strong>justo</strong> que o padrão brasileiro. Se você gosta de folga ou está entre dois tamanhos, <strong>suba um tamanho</strong>.</p>
<h2>Versão jogador x torcedor</h2>
<p>A versão jogador é mais colada ao corpo; a torcedor é mais confortável. Na dúvida, a torcedor agrada a maioria.</p>
<p>Ainda com dúvida no tamanho? Fale com a gente antes de comprar — ou use o provador na página de cada <a href="/categoria/brasileirao">produto</a>.</p>
`,
  },
];

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
