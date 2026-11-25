// Artigos evergreen. Escreva aqui novos guias (HTML simples) — a página é gerada automaticamente.
export interface Guia { slug: string; titulo: string; desc: string; resposta: string; html: string; atualizado: string }

export const GUIAS: Guia[] = [
  {
    slug: 'qual-loteria-tem-mais-chance-de-ganhar',
    titulo: 'Qual loteria tem mais chance de ganhar? Ranking completo',
    desc: 'Comparamos a probabilidade de acertar a faixa principal em todas as loterias da Caixa, com o custo de cada aposta.',
    resposta: 'Com a aposta mínima, a loteria com maior chance na faixa principal é o <strong>Dia de Sorte</strong> (1 em 2.629.575), seguido da <strong>Lotofácil</strong> (1 em 3.268.760) e do <strong>Super Sete</strong> (1 em 10.000.000). A mais difícil é a <strong>+Milionária</strong> (1 em 238.360.500).',
    atualizado: '2026-11-25',
    html: `
<p>Para comparar loterias de forma justa, usamos a <strong>aposta mínima</strong> de cada uma e calculamos a probabilidade de acertar a faixa principal por análise combinatória.</p>
<h2>Ranking: chance de ganhar o prêmio principal</h2>
<div class="table-wrap"><table><thead><tr><th>#</th><th>Loteria</th><th class="num">Chance (aposta mínima)</th><th class="num">Preço</th></tr></thead><tbody>
<tr><td>1</td><td>Dia de Sorte (7 números)</td><td class="num">1 em 2.629.575</td><td class="num">R$ 2,50</td></tr>
<tr><td>2</td><td>Lotofácil (15 números)</td><td class="num">1 em 3.268.760</td><td class="num">R$ 3,50</td></tr>
<tr><td>3</td><td>Super Sete (7 colunas)</td><td class="num">1 em 10.000.000</td><td class="num">R$ 3,00</td></tr>
<tr><td>4</td><td>Lotomania (50 números)</td><td class="num">1 em 11.372.636</td><td class="num">R$ 3,00</td></tr>
<tr><td>5</td><td>Dupla Sena (por sorteio)</td><td class="num">1 em 15.890.700</td><td class="num">R$ 3,00</td></tr>
<tr><td>6</td><td>Quina (5 números)</td><td class="num">1 em 24.040.016</td><td class="num">R$ 3,00</td></tr>
<tr><td>7</td><td>Timemania (10 números)</td><td class="num">1 em 26.472.637</td><td class="num">R$ 3,50</td></tr>
<tr><td>8</td><td>Mega-Sena (6 números)</td><td class="num">1 em 50.063.860</td><td class="num">R$ 6,00</td></tr>
<tr><td>9</td><td>+Milionária (6 + 2 trevos)</td><td class="num">1 em 238.360.500</td><td class="num">R$ 6,00</td></tr>
</tbody></table></div>
<h2>Chance não é tudo: olhe também o prêmio</h2>
<p>Loterias com chance maior costumam pagar prêmios menores, porque o valor é dividido entre mais ganhadores. A Lotofácil, por exemplo, premia a partir de 11 acertos, com prêmios fixos nas faixas de 11, 12 e 13 acertos, o que a torna a modalidade em que é mais comum "ganhar alguma coisa". Já a Mega-Sena e a +Milionária concentram prêmios milionários, com chances muito menores.</p>
<h2>Como aumentar a chance</h2>
<ul><li><strong>Marcar mais números</strong> multiplica a chance e o preço na mesma proporção.</li><li><strong>Bolões</strong> dividem o custo de apostas maiores entre um grupo.</li><li>Nenhum método, palpite ou "número quente" altera a probabilidade de um sorteio.</li></ul>
<p>Calcule qualquer cenário na <a href="/ferramentas/calculadora-de-probabilidades/">calculadora de probabilidades</a>.</p>`,
  },
  {
    slug: 'imposto-de-renda-sobre-premios-de-loteria',
    titulo: 'Imposto de Renda sobre prêmios de loteria: como funciona',
    desc: 'Entenda a retenção de 30% de IR sobre prêmios de loteria, como declarar e o que acontece com o dinheiro em bolões.',
    resposta: 'Prêmios de loteria acima do limite de isenção têm <strong>30% de Imposto de Renda retido na fonte</strong> pela própria Caixa no momento do pagamento. O ganhador recebe o valor já líquido e declara o prêmio como rendimento sujeito à tributação exclusiva.',
    atualizado: '2026-11-25',
    html: `
<h2>Quanto é descontado</h2>
<p>A legislação brasileira determina a retenção de <strong>30% de IR na fonte</strong> sobre prêmios de loterias acima do limite de isenção. A retenção é feita pela Caixa no momento do pagamento — o ganhador não precisa recolher nada à parte.</p>
<p>Exemplo: um prêmio bruto de R$ 10.000.000,00 resulta em R$ 7.000.000,00 líquidos.</p>
<h2>Como declarar</h2>
<p>Na declaração anual, o prêmio é informado em <strong>Rendimentos sujeitos à tributação exclusiva/definitiva</strong>, com o CNPJ da Caixa como fonte pagadora. O valor recebido também precisa aparecer em <strong>Bens e Direitos</strong> conforme onde foi aplicado.</p>
<h2>E no bolão?</h2>
<p>No Bolão Caixa, o imposto é retido sobre o prêmio total e cada cotista recebe sua parte líquida. Em bolões informais, o ideal é formalizar a divisão por escrito, porque a transferência de valores a outras pessoas pode ser interpretada como doação, sujeita a imposto estadual (ITCMD). Procure orientação contábil.</p>
<p>Simule o valor líquido na <a href="/ferramentas/premio-liquido/">calculadora de prêmio líquido</a>.</p>
<blockquote>Este conteúdo é informativo e não substitui orientação de um contador.</blockquote>`,
  },
  {
    slug: 'como-fazer-bolao',
    titulo: 'Como fazer um bolão de loteria: guia completo e seguro',
    desc: 'Passo a passo para organizar um bolão: Bolão Caixa x bolão entre amigos, divisão de cotas, registro e prêmios.',
    resposta: 'A forma mais segura de fazer bolão é o <strong>Bolão Caixa</strong>, registrado na lotérica: cada participante recebe um recibo de cota próprio e pode resgatar sua parte do prêmio individualmente.',
    atualizado: '2026-11-25',
    html: `
<h2>Bolão Caixa x bolão entre amigos</h2>
<ul><li><strong>Bolão Caixa:</strong> registrado na lotérica, com recibo individual por cota. É o mais seguro e permite o resgate individual. Pode haver tarifa de serviço.</li><li><strong>Bolão informal:</strong> um organizador faz as apostas em seu nome e divide o prêmio. Funciona por confiança — registre tudo por escrito.</li></ul>
<h2>Passo a passo</h2>
<ol><li>Defina o orçamento total e o valor da cota.</li><li>Escolha a loteria e quantos números por jogo (use a <a href="/ferramentas/calculadora-de-bolao/">calculadora de bolão</a>).</li><li>Registre os participantes, quanto cada um pagou e quantas cotas tem.</li><li>Faça as apostas e compartilhe fotos dos comprovantes com todos.</li><li>Depois do sorteio, confira os jogos no <a href="/ferramentas/conferidor/">conferidor</a>.</li></ol>
<h2>Dicas</h2>
<ul><li>Prefira jogos com mais números a muitos jogos simples repetidos.</li><li>Evite combinações populares (datas, sequências) para não dividir prêmio com outros ganhadores.</li><li>Combine antes como será a divisão de prêmios pequenos (reinvestir ou dividir).</li></ul>`,
  },
  {
    slug: 'como-resgatar-premio-da-loteria',
    titulo: 'Como resgatar prêmio da loteria: prazos, locais e documentos',
    desc: 'Onde e como receber prêmios de loteria: valores pagos em lotéricas, em agências da Caixa, prazo de 90 dias e documentos necessários.',
    resposta: 'O prazo para resgatar qualquer prêmio de loteria é de <strong>90 dias corridos</strong> após o sorteio. Prêmios menores podem ser recebidos em lotéricas; prêmios maiores são pagos em agências da Caixa, com bilhete original e documento com CPF.',
    atualizado: '2026-11-25',
    html: `
<h2>Onde receber</h2>
<ul><li><strong>Lotéricas:</strong> pagam prêmios até o limite definido pela Caixa.</li><li><strong>Agências da Caixa:</strong> pagam prêmios de qualquer valor; acima do limite das lotéricas, o pagamento é feito somente nelas.</li><li><strong>Apostas digitais:</strong> prêmios menores podem ser creditados na conta cadastrada; os maiores seguem para resgate em agência.</li></ul>
<h2>Documentos</h2>
<p>Leve o bilhete original (sem rasuras), documento de identificação com foto e CPF. Para prêmios altos, a Caixa oferece atendimento especializado e orientação financeira.</p>
<h2>Prazo</h2>
<p>São <strong>90 dias corridos</strong> a partir da data do sorteio. Depois disso, o valor não resgatado é repassado ao FIES (Fundo de Financiamento Estudantil).</p>
<h2>Proteja seu bilhete</h2>
<ul><li>Assine o verso do bilhete físico.</li><li>Fotografe o comprovante.</li><li>Não divulgue o bilhete premiado nas redes sociais.</li></ul>`,
  },
];
export const POR_GUIA = Object.fromEntries(GUIAS.map((g) => [g.slug, g]));
