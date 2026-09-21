/** Artigos do blog (SEO). Conteúdo autoral, HTML confiável (não é input de usuário). */
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
      "Entenda o que são as camisas de futebol importadas, a diferença entre as versões e por que valem a pena, qualidade, preço e como comprar com segurança.",
    date: "2026-09-01",
    readMin: 5,
    tag: "Guia",
    body: `
<p>As <strong>camisas de futebol importadas</strong> conquistaram o torcedor brasileiro por um motivo simples: entregam o visual e a pegada das oficiais por uma fração do preço. Mas ainda gera dúvida, vale a pena? Neste guia a gente explica tudo.</p>
<h2>O que são camisas importadas?</h2>
<p>São réplicas de alta qualidade produzidas no exterior (o padrão mais conhecido é a chamada <strong>qualidade tailandesa 1:1</strong>), com tecido, escudo bordado e detalhes muito próximos da peça oficial. Cobrem clubes e seleções do mundo todo, em versões atuais e <strong>retrô</strong>.</p>
<h2>Por que valem a pena</h2>
<ul>
  <li><strong>Preço justo:</strong> você paga bem menos que numa loja oficial.</li>
  <li><strong>Variedade:</strong> times e temporadas que muitas vezes nem chegam ao Brasil.</li>
  <li><strong>Qualidade:</strong> as versões 1:1 têm acabamento excelente, difícil de distinguir da oficial.</li>
</ul>
<h2>Como comprar com segurança</h2>
<p>Prefira lojas com fotos reais do produto, canais de atendimento ativos e política clara de troca. Na <strong>GG Peitas</strong> você encontra <a href="/categoria/brasileirao">camisas do Brasileirão</a>, <a href="/categoria/europa">clubes europeus</a>, <a href="/categoria/selecoes">seleções</a> e <a href="/categoria/retro">retrôs</a>, com frete grátis acima de R$299 e até 3x sem juros.</p>
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
<p>Nem toda réplica é igual. A <strong>camisa tailandesa 1:1</strong> é o topo das importadas, feita para ficar o mais próximo possível da oficial. Veja como reconhecer a qualidade de verdade.</p>
<h2>1. Escudo e patrocínios</h2>
<p>Nas versões premium, o escudo é <strong>bordado</strong> (não estampado) e os patrocínios têm impressão nítida, sem borrar. Bordas irregulares são sinal de peça inferior.</p>
<h2>2. Tecido e caimento</h2>
<p>O tecido é <strong>dry-fit</strong>, leve e respirável, com a textura correta do modelo. Caimento certinho no corpo, sem parecer "camisa de algodão".</p>
<h2>3. Costuras e acabamento</h2>
<p>Costuras retas e reforçadas, gola bem-feita e etiquetas internas alinhadas. Detalhes como listras e golas devem bater com a foto oficial.</p>
<h2>4. Tamanho</h2>
<p>As importadas costumam vestir um pouco mais justo. Sempre confira a <a href="/">tabela de medidas</a> antes de comprar, na dúvida, suba um tamanho.</p>
<p>Na <strong>GG Peitas</strong> trabalhamos com o padrão 1:1 e mostramos fotos reais de cada modelo. Confira as <a href="/promocao">camisas em promoção</a> ou explore por <a href="/categoria/europa">liga e time</a>.</p>
`,
  },
  {
    slug: "camisas-retro-mais-iconicas",
    title: "Camisas retrô: as mais icônicas do futebol",
    description:
      "Um passeio pelas camisas retrô mais lendárias, Brasil, Flamengo, clubes europeus, e por que elas voltaram a ser desejo de todo torcedor.",
    date: "2026-09-10",
    readMin: 4,
    tag: "Retrô",
    body: `
<p>As <strong>camisas retrô</strong> viraram febre, e não é à toa. Elas carregam história, títulos e a nostalgia de gerações. Reunimos algumas das mais icônicas.</p>
<h2>Seleção Brasileira</h2>
<p>Das conquistas de Copa às camisas dos anos 90 e 2000, a amarelinha retrô é objeto de desejo. Veja as opções em <a href="/categoria/selecoes">Seleções</a>.</p>
<h2>Clubes brasileiros</h2>
<p>Flamengo, Palmeiras, Corinthians, Grêmio, Cruzeiro… os mantos clássicos dos grandes do <a href="/categoria/brasileirao">Brasileirão</a> nunca saem de moda.</p>
<h2>Gigantes europeus</h2>
<p>Real Madrid, Barcelona, Milan, Manchester United, as retrôs dos <a href="/categoria/europa">gigantes europeus</a> resgatam eras douradas do futebol mundial.</p>
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
<p>Ainda com dúvida no tamanho? Fale com a gente antes de comprar ou use o provador na página de cada <a href="/categoria/brasileirao">produto</a>.</p>
`,
  },
  {
    slug: "como-cuidar-lavar-camisa-de-futebol",
    title: "Como lavar e cuidar da camisa de futebol para durar mais",
    description:
      "Passo a passo para lavar a camisa de futebol sem estragar escudo, números e tecido: temperatura, avesso, secagem e o que nunca fazer.",
    date: "2026-09-16",
    readMin: 4,
    tag: "Dicas",
    body: `
<p>Uma <strong>camisa importada 1:1</strong> de qualidade dura anos se você lavar do jeito certo. O segredo é proteger o tecido dry-fit, o escudo bordado e as estampas. Veja o passo a passo.</p>
<h2>Antes de lavar</h2>
<ul>
  <li>Vire a camisa <strong>do avesso</strong>. Isso protege escudo, patrocínios e números do atrito.</li>
  <li>Feche o zíper (se tiver) e não deixe de molho por muito tempo.</li>
</ul>
<h2>Na hora de lavar</h2>
<ul>
  <li>Use <strong>água fria</strong> e sabão neutro. Água quente desbota e solta estampa.</li>
  <li>Prefira lavar <strong>à mão</strong> ou na máquina em ciclo delicado, dentro de um saquinho de roupa.</li>
  <li><strong>Nada de alvejante</strong> nem amaciante em excesso.</li>
</ul>
<h2>Secagem</h2>
<p>Seque à <strong>sombra</strong>, nunca no sol forte nem na secadora. O calor deforma o tecido e racha as estampas. Não passe ferro direto sobre escudo e números.</p>
<p>Seguindo isso, sua camisa continua com cara de nova por muito tempo. Quer renovar a coleção? Veja as <a href="/promocao">camisas em promoção</a> ou explore por <a href="/categoria/brasileirao">time e liga</a>.</p>
`,
  },
  {
    slug: "prazo-de-entrega-camisas-importadas",
    title: "Prazo de entrega das camisas importadas: como funciona o envio",
    description:
      "Entenda o prazo e o envio das camisas importadas: de onde saem, quanto tempo levam, como acompanhar o pedido e por que vale a pena esperar.",
    date: "2026-09-18",
    readMin: 4,
    tag: "Guia",
    body: `
<p>Uma dúvida comum de quem compra <strong>camisa importada</strong> pela primeira vez é o prazo. A gente explica tudo de forma transparente para você comprar tranquilo.</p>
<h2>De onde sai a camisa</h2>
<p>Trabalhamos direto com o fornecedor, sem intermediários encarecendo o produto. Por isso o preço fica justo e você tem acesso a modelos que muitas vezes nem chegam às lojas do Brasil.</p>
<h2>Quanto tempo leva</h2>
<p>Como o envio é direto do fornecedor, o prazo costuma ser de <strong>3 a 4 semanas</strong>. Não é o mesmo que um e-commerce nacional, mas é o que garante o preço baixo e a variedade enorme de times e temporadas.</p>
<h2>Como acompanhar</h2>
<p>Você recebe as atualizações do pedido e pode consultar o status pela página de <a href="/rastrear">rastreio</a>. Qualquer dúvida, é só falar com a gente pelo <a href="/contato">contato</a>.</p>
<p>Ainda com receio? Veja nossas <a href="/faq">perguntas frequentes</a> e a <a href="/trocas">política de trocas</a>. E se não achar o modelo que procura, faça uma <a href="/solicitar">solicitação</a> que a gente busca pra você.</p>
`,
  },
  {
    slug: "camisa-de-futebol-para-presentear",
    title: "Camisa de futebol de presente: o guia para acertar",
    description:
      "Vai presentear um torcedor? Veja como escolher o time, o tamanho e a versão da camisa de futebol para acertar em cheio, mesmo sem entender de futebol.",
    date: "2026-09-19",
    readMin: 5,
    tag: "Guia",
    body: `
<p>Poucos presentes emocionam um apaixonado por futebol como a <strong>camisa do time do coração</strong>. Mas para acertar sem errar o time nem o tamanho, siga estas dicas.</p>
<h2>1. Confirme o time (e o detalhe)</h2>
<p>Parece óbvio, mas vale confirmar o clube ou seleção. Um plus é descobrir se a pessoa curte a camisa <strong>atual</strong> ou uma <a href="/categoria/retro">retrô</a> de alguma época marcante.</p>
<h2>2. Acerte o tamanho</h2>
<p>Na dúvida, veja uma camisa que a pessoa já usa e confira a nossa <a href="/blog/tamanho-camisa-importada-como-escolher">tabela de medidas</a>. As importadas vestem um pouco mais justo, então entre dois tamanhos, suba um.</p>
<h2>3. Escolha o modelo</h2>
<p>Home (principal), away (reserva) ou third (terceiro uniforme). Se não souber, a Home costuma ser a aposta mais segura porque é a mais clássica.</p>
<h2>4. Programe-se pelo prazo</h2>
<p>Como é importada, a entrega leva algumas semanas. Comprando com antecedência, chega a tempo da data especial. Veja como funciona o <a href="/blog/prazo-de-entrega-camisas-importadas">prazo de entrega</a>.</p>
<p>Bora escolher? Comece pelas <a href="/categoria/brasileirao">camisas do Brasileirão</a>, pelos <a href="/categoria/europa">clubes europeus</a> ou pelas <a href="/categoria/selecoes">seleções</a>.</p>
`,
  },
  {
    slug: "camisas-do-brasileirao-guia-times",
    title: "Camisas do Brasileirão: guia dos times mais procurados",
    description:
      "Um giro pelas camisas do Brasileirão mais buscadas: Flamengo, Palmeiras, Corinthians, São Paulo e mais, com versões atuais e retrôs importadas.",
    date: "2026-09-21",
    readMin: 6,
    tag: "Guia",
    body: `
<p>As <strong>camisas do Brasileirão</strong> estão entre as mais procuradas do país. Reunimos os times que mais bombam e onde encontrar cada um em versão importada premium.</p>
<h2>Os gigantes</h2>
<p><strong>Flamengo, Palmeiras, Corinthians e São Paulo</strong> lideram a busca, tanto pelas camisas atuais quanto pelas <a href="/categoria/retro">retrôs</a> que marcaram época. Times como <strong>Grêmio, Internacional, Cruzeiro, Atlético-MG, Vasco, Botafogo, Fluminense e Santos</strong> também têm forte procura.</p>
<h2>Atual ou retrô?</h2>
<p>A camisa <strong>atual</strong> é a escolha de quem quer o modelo da temporada. Já a <strong>retrô</strong> é para quem tem uma memória afetiva com um elenco ou título específico. Na GG Peitas você acha as duas.</p>
<h2>Como encontrar a do seu time</h2>
<p>É simples: entre na coleção do <a href="/busca?league=brasileirao">Brasileirão</a> e filtre pelo seu clube na barra lateral. Todos com qualidade 1:1, frete para todo o Brasil e até 3x sem juros.</p>
<p>Não achou o seu? A gente busca pra você: faça uma <a href="/solicitar">solicitação</a> com o modelo desejado.</p>
`,
  },
  {
    slug: "camisas-de-selecoes-guia",
    title: "Camisas de seleções: guia para torcer e colecionar",
    description:
      "Tudo sobre camisas de seleções importadas: Brasil, Argentina, França e mais, versões atuais e retrôs históricos de Copa do Mundo, com qualidade 1:1.",
    date: "2026-09-20",
    readMin: 5,
    tag: "Guia",
    body: `
<p>Poucas peças carregam tanta emoção quanto a <strong>camisa de uma seleção</strong>. Seja pela paixão nacional ou pela memória de uma Copa, elas são item obrigatório do torcedor e do colecionador.</p>
<h2>As mais procuradas</h2>
<p>A camisa do <strong>Brasil</strong> lidera a busca, seguida por <strong>Argentina, França, Alemanha, Itália e Portugal</strong>. Cada uma com modelos atuais e clássicos que marcaram gerações.</p>
<h2>Atual ou retrô?</h2>
<p>A <strong>versão atual</strong> é a escolha para acompanhar a seleção na temporada. Já a <a href="/categoria/retro">retrô</a> resgata elencos e conquistas históricas, ótima para colecionar.</p>
<h2>Qualidade 1:1</h2>
<p>Nossas camisas de seleção seguem o padrão importado <strong>1:1</strong>, com escudo bordado, tecido dry-fit e acabamento premium. Veja a coleção completa de <a href="/categoria/selecoes">seleções</a>.</p>
<p>Não achou a sua? Faça uma <a href="/solicitar">solicitação</a> que a gente busca pra você.</p>
`,
  },
  {
    slug: "camisa-home-away-third-diferenca",
    title: "Home, away e third: o que significa cada camisa",
    description:
      "Entenda a diferença entre camisa home, away e third (e pré-jogo e goleiro): qual é a principal, quando cada uma é usada e como escolher a sua.",
    date: "2026-09-20",
    readMin: 4,
    tag: "Dicas",
    body: `
<p>Ao comprar uma <strong>camisa de futebol</strong>, você encontra termos como home, away e third. Saber o que cada um significa ajuda a escolher a certa.</p>
<h2>Home (principal)</h2>
<p>É o <strong>uniforme principal</strong>, com as cores clássicas do clube ou seleção. Costuma ser a mais tradicional e a aposta mais segura como presente.</p>
<h2>Away (reserva)</h2>
<p>O <strong>segundo uniforme</strong>, usado quando as cores da home se confundem com as do adversário. Geralmente traz cores alternativas e visuais mais ousados.</p>
<h2>Third (terceiro)</h2>
<p>Um <strong>terceiro uniforme</strong>, muitas vezes o mais criativo da temporada, usado em jogos específicos. Vira item de colecionador pelo design diferente.</p>
<h2>E os outros?</h2>
<p>Você também vê versões de <strong>goleiro</strong>, <strong>pré-jogo</strong> (aquecimento) e edições especiais. Explore todos os modelos por <a href="/categoria/brasileirao">time e liga</a> na loja.</p>
`,
  },
  {
    slug: "camisa-manga-longa-vale-a-pena",
    title: "Camisa manga longa: quando vale a pena",
    description:
      "A camisa de futebol manga longa combina estilo e conforto no frio. Veja quando ela vale a pena, diferenças para a manga curta e modelos retrô icônicos.",
    date: "2026-09-21",
    readMin: 3,
    tag: "Dicas",
    body: `
<p>A <strong>camisa manga longa</strong> tem um charme especial e é a preferida de muita gente, principalmente no frio e nas versões retrô.</p>
<h2>Quando escolher a manga longa</h2>
<ul>
  <li><strong>Clima frio:</strong> mais conforto sem perder o estilo do uniforme.</li>
  <li><strong>Visual clássico:</strong> muitos uniformes retrô ficaram famosos justamente na manga longa.</li>
  <li><strong>Diferenciação:</strong> foge do comum e valoriza a coleção.</li>
</ul>
<h2>Manga longa x manga curta</h2>
<p>O design é o mesmo do modelo curto, mudando o comprimento da manga. Por ser uma peça mais elaborada, costuma ter valor um pouco acima da curta.</p>
<p>Procurando uma? Busque por "manga longa" na loja ou explore os <a href="/categoria/retro">retrôs</a>, onde elas aparecem com frequência.</p>
`,
  },
  {
    slug: "personalizar-camisa-nome-numero",
    title: "Personalização da camisa: nome e número do jeito certo",
    description:
      "Como personalizar sua camisa de futebol com nome e número: dicas de escolha, cuidado com o tamanho da fonte e como fica o acabamento na versão importada.",
    date: "2026-09-21",
    readMin: 3,
    tag: "Dicas",
    body: `
<p>Colocar o <strong>nome e número</strong> deixa a camisa com a sua cara, seja com o seu nome, o do ídolo ou o de quem vai ganhar de presente.</p>
<h2>Escolha o que faz sentido</h2>
<p>Pode ser o seu nome e número da sorte, o do craque do time ou uma homenagem. Na dúvida em um presente, o nome da própria pessoa costuma emocionar mais.</p>
<h2>Dicas para acertar</h2>
<ul>
  <li>Confira a grafia com atenção antes de finalizar. Personalização não tem troca por arrependimento.</li>
  <li>Nomes muito longos podem ficar apertados. Prefira algo curto e legível.</li>
  <li>O acabamento segue o padrão do uniforme, combinando com a tipografia do time.</li>
</ul>
<p>Na página de cada produto você adiciona a personalização antes de comprar. Escolha seu modelo em <a href="/categoria/brasileirao">Brasileirão</a>, <a href="/categoria/europa">Europa</a> ou <a href="/categoria/selecoes">seleções</a>.</p>
`,
  },
];

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
