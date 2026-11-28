// Guias editoriais. Cada guia tem texto (HTML simples com H2/H3), resposta direta e FAQ.
// Probabilidades citadas são calculadas por análise combinatória (veja /metodologia/).
import { LOTERIAS, POR_SLUG, diasTexto } from './loterias';
import { custo, probabilidade, chance, C } from './math';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const n0 = (v: number) => Math.round(v).toLocaleString('pt-BR');
const LF = POR_SLUG['lotofacil'];
const lf11 = () => { let t = 0; for (let k = 11; k <= 15; k++) t += probabilidade(LF, k, 15); return t; };
const tabelaHorarios = `<div class="table-wrap"><table><thead><tr><th>Loteria</th><th>Dias de sorteio</th><th>Horário</th></tr></thead><tbody>${LOTERIAS.map((l) => `<tr><td><a href="/${l.slug}/">${l.nome}</a></td><td>${diasTexto(l)}</td><td>20h</td></tr>`).join('')}</tbody></table></div>`;
const tabelaPrecos = `<div class="table-wrap"><table><thead><tr><th>Loteria</th><th class="num">Aposta mínima</th><th>O que você marca</th><th class="num">Aposta máxima</th><th class="num">Chance (mínima)</th></tr></thead><tbody>${LOTERIAS.map((l) => {
  const max = l.tipo === 'fixo' ? l.preco : l.tipo === 'colunas' ? l.preco * 3 ** 7 : custo(l, l.escolhaMax, l.tipo === 'trevos' ? 6 : 2);
  const marca = l.tipo === 'colunas' ? '7 a 21 números em 7 colunas' : l.tipo === 'trevos' ? '6 a 12 números + 2 a 6 trevos' : l.escolhaMin === l.escolhaMax ? `${l.escolhaMin} números` : `${l.escolhaMin} a ${l.escolhaMax} números`;
  const ch = l.tipo === 'trevos' ? chance(probabilidade(l, 6, 6, 2, 2)) : chance(probabilidade(l, l.faixas[0].acertos));
  return `<tr><td><a href="/${l.slug}/como-jogar/">${l.nome}</a></td><td class="num">${brl(l.preco)}</td><td>${marca}</td><td class="num">${brl(max)}</td><td class="num">1 em ${n0(ch)}</td></tr>`;
}).join('')}</tbody></table></div>`;
const tabelaLF = `<div class="table-wrap"><table><thead><tr><th>Números</th><th class="num">Preço</th><th class="num">Chance de 15 acertos</th><th class="num">Chance de 14 acertos</th></tr></thead><tbody>${[15, 16, 17, 18, 19, 20].map((n) => `<tr><td>${n}</td><td class="num">${brl(custo(LF, n))}</td><td class="num">1 em ${n0(chance(probabilidade(LF, 15, n)))}</td><td class="num">1 em ${n0(chance(probabilidade(LF, 14, n)))}</td></tr>`).join('')}</tbody></table></div>`;
export interface Guia {
  slug: string; titulo: string; desc: string; resposta: string; html: string;
  atualizado: string; publicado: string; faq: { q: string; a: string }[];
}

export const GUIAS: Guia[] = [
  {
    slug: 'qual-loteria-tem-mais-chance-de-ganhar',
    titulo: 'Qual loteria tem mais chance de ganhar? Ranking completo',
    desc: 'Comparamos a probabilidade de acertar o prêmio principal e de ganhar qualquer prêmio em todas as loterias da Caixa, com o custo de cada aposta.',
    resposta: 'Com a aposta mínima, a loteria com maior chance na faixa principal é o <strong>Dia de Sorte</strong> (1 em 2.629.575), seguido da <strong>Lotofácil</strong> (1 em 3.268.760) e do <strong>Super Sete</strong> (1 em 10.000.000). A mais difícil é a <strong>+Milionária</strong> (1 em 238.360.500). Para ganhar <em>algum</em> prêmio, a Lotofácil é a mais generosa: cerca de 1 chance em 9 de fazer 11 acertos ou mais.',
    publicado: '2026-11-25', atualizado: '2026-11-26',
    html: `
<p>"Qual loteria é mais fácil de ganhar?" é a pergunta mais comum de quem aposta. A resposta depende do que você chama de "ganhar": acertar o prêmio principal, que costuma ser milionário, ou levar <em>qualquer</em> prêmio, mesmo pequeno. Neste guia comparamos as nove modalidades da Caixa nos dois critérios, sempre com a aposta mínima e com probabilidades calculadas por análise combinatória — a mesma matemática usada pela própria Caixa.</p>

<h2>Ranking: chance de ganhar o prêmio principal</h2>
<p>A tabela abaixo ordena as loterias pela chance de acertar a faixa principal com a aposta mais barata. Quanto menor o número depois de "1 em", mais fácil.</p>
<div class="table-wrap"><table><thead><tr><th>#</th><th>Loteria (aposta mínima)</th><th class="num">Chance na faixa principal</th><th class="num">Preço</th></tr></thead><tbody>
<tr><td>1</td><td>Dia de Sorte (7 números)</td><td class="num">1 em 2.629.575</td><td class="num">R$ 2,50</td></tr>
<tr><td>2</td><td>Lotofácil (15 números)</td><td class="num">1 em 3.268.760</td><td class="num">R$ 3,50</td></tr>
<tr><td>3</td><td>Super Sete (7 colunas)</td><td class="num">1 em 10.000.000</td><td class="num">R$ 3,00</td></tr>
<tr><td>4</td><td>Lotomania (50 números)</td><td class="num">1 em 11.372.636</td><td class="num">R$ 3,00</td></tr>
<tr><td>5</td><td>Dupla Sena (por sorteio)</td><td class="num">1 em 15.890.700</td><td class="num">R$ 3,00</td></tr>
<tr><td>6</td><td>Quina (5 números)</td><td class="num">1 em 24.040.016</td><td class="num">R$ 3,00</td></tr>
<tr><td>7</td><td>Timemania (10 números)</td><td class="num">1 em 26.472.637</td><td class="num">R$ 3,50</td></tr>
<tr><td>8</td><td>Mega-Sena (6 números)</td><td class="num">1 em 50.063.860</td><td class="num">R$ 6,00</td></tr>
<tr><td>9</td><td>+Milionária (6 números + 2 trevos)</td><td class="num">1 em 238.360.500</td><td class="num">R$ 6,00</td></tr>
</tbody></table></div>
<p>Preços conforme a tabela vigente da Caixa (reajuste de julho de 2025). Na Dupla Sena, o mesmo bilhete concorre em dois sorteios, então a chance de acertar a sena em pelo menos um deles é praticamente o dobro: cerca de 1 em 7,9 milhões.</p>

<h2>Como essas probabilidades são calculadas</h2>
<p>Em loterias de números, a conta é a mesma: dividir o número de combinações que ganham pelo total de combinações possíveis. Na Mega-Sena, por exemplo, existem 50.063.860 maneiras diferentes de escolher 6 números entre 60 — é o que os matemáticos chamam de "combinação de 60, 6 a 6". Como uma aposta simples cobre exatamente uma dessas combinações, a chance é de 1 em 50.063.860.</p>
<h3>Por que a Lotofácil parece tão fácil</h3>
<p>Na Lotofácil você escolhe 15 números entre 25, e o sorteio também tira 15. Como você "cobre" mais da metade do volante, há muito menos combinações possíveis (3.268.760). O mesmo raciocínio explica o Dia de Sorte: são só 31 números, e você marca 7 dos 7 sorteados.</p>
<h3>O caso do Super Sete</h3>
<p>No Super Sete, cada uma das 7 colunas tem 10 números possíveis (0 a 9). A chance de acertar todas as colunas é 1 em 10 × 10 × 10 × 10 × 10 × 10 × 10, ou seja, 1 em 10 milhões.</p>

<h2>Chance de ganhar qualquer prêmio</h2>
<p>Se o objetivo é ganhar alguma coisa, a ordem muda. Algumas loterias pagam faixas menores com muita frequência:</p>
<ul>
<li><strong>Lotofácil:</strong> premia a partir de 11 acertos. A chance de fazer 11, 12, 13, 14 ou 15 pontos com uma aposta simples é de aproximadamente <strong>1 em 9</strong>. As faixas de 11 a 13 acertos têm prêmios fixos.</li>
<li><strong>Quina:</strong> paga a partir do "duque" (2 acertos). A chance de ganhar algum prêmio é de cerca de <strong>1 em 34</strong>.</li>
<li><strong>Lotomania:</strong> premia com 15 a 20 acertos e também com zero acerto, o que a torna curiosa: errar tudo também dá prêmio.</li>
<li><strong>Mega-Sena:</strong> a faixa mais baixa é a quadra (4 acertos), com chance de <strong>1 em 2.332</strong> por aposta simples.</li>
</ul>

<h2>Chance não é tudo: compare com o prêmio</h2>
<p>Loterias mais fáceis costumam pagar prêmios menores, porque o dinheiro é dividido entre mais acertadores. A Mega-Sena e a +Milionária são difíceis, mas concentram os maiores prêmios do país — e a Mega da Virada, que não acumula, pode passar de R$ 1 bilhão. Já a Lotofácil distribui prêmios menores com muito mais frequência.</p>
<p>Uma forma honesta de comparar é olhar o custo para "comprar" uma chance. Cada real gasto em qualquer loteria tem retorno médio esperado menor do que o valor apostado, porque parte da arrecadação vai para repasses sociais e custos. Por isso, loteria deve ser encarada como entretenimento, nunca como investimento.</p>

<h2>Como aumentar a chance (de verdade)</h2>
<h3>Marcar mais números</h3>
<p>Na Mega-Sena, um jogo com 7 números cobre 7 combinações de 6 e custa 7 vezes mais; com 10 números, são 210 combinações. A chance aumenta exatamente na mesma proporção do preço. Simule qualquer cenário na <a href="/ferramentas/calculadora-de-probabilidades/">calculadora de probabilidades</a>.</p>
<h3>Participar de bolões</h3>
<p>O bolão permite que um grupo divida o custo de apostas maiores. A chance do grupo cresce, e cada participante paga só sua cota — em troca, o prêmio também é dividido. Veja o <a href="/guias/como-fazer-bolao/">guia de bolão</a>.</p>
<h3>O que não funciona</h3>
<p>Nenhum método, "número quente", robô ou palpite altera a probabilidade de um sorteio. Cada concurso é independente: uma dezena que não sai há muito tempo não fica "devendo". O que você pode fazer é evitar combinações muito populares (como datas de aniversário), que costumam dividir o prêmio com mais ganhadores.</p>

<h2>Resumo</h2>
<ul>
<li>Maior chance no prêmio principal: <strong>Dia de Sorte</strong> e <strong>Lotofácil</strong>.</li>
<li>Maior chance de ganhar qualquer prêmio: <strong>Lotofácil</strong>.</li>
<li>Maiores prêmios (e menores chances): <strong>Mega-Sena</strong> e <strong>+Milionária</strong>.</li>
<li>Jogue com limite de gastos e encare a aposta como diversão. Leia nosso guia de <a href="/jogo-responsavel/">jogo responsável</a>.</li>
</ul>`,
    faq: [
      { q: 'Qual a loteria mais fácil de ganhar?', a: 'No prêmio principal, com a aposta mínima, o Dia de Sorte (1 em 2.629.575) e a Lotofácil (1 em 3.268.760). Para ganhar qualquer prêmio, a Lotofácil é a mais fácil: cerca de 1 em 9.' },
      { q: 'Qual a chance de ganhar na Mega-Sena com 6 números?', a: '1 em 50.063.860 para a sena. Para a quina, 1 em 154.518; para a quadra, 1 em 2.332.' },
      { q: 'Jogar sempre os mesmos números aumenta a chance?', a: 'Não. Cada sorteio é independente, e qualquer combinação tem a mesma probabilidade em todos os concursos.' },
      { q: 'Vale mais a pena a Lotofácil ou a Mega-Sena?', a: 'Depende do objetivo: a Lotofácil dá prêmios com muito mais frequência, mas menores; a Mega-Sena é muito mais difícil, mas paga prêmios milionários.' },
    ],
  },
  {
    slug: 'imposto-de-renda-sobre-premios-de-loteria',
    titulo: 'Imposto de Renda sobre prêmios de loteria: como funciona',
    desc: 'Entenda a retenção de 30% de IR sobre prêmios de loteria, como declarar o prêmio, o que acontece em bolões e como ficam os rendimentos depois.',
    resposta: 'Prêmios de loteria acima do limite de isenção têm <strong>30% de Imposto de Renda retido na fonte</strong> pela própria Caixa no momento do pagamento. O ganhador recebe o valor líquido e informa o prêmio na declaração anual como <strong>rendimento sujeito à tributação exclusiva/definitiva</strong>, sem pagar imposto de novo.',
    publicado: '2026-11-25', atualizado: '2026-11-26',
    html: `
<p>Ganhar na loteria muda a vida financeira de qualquer pessoa — e logo surge a dúvida: quanto do prêmio fica com o Leão? Neste guia explicamos, em linguagem simples, como funciona a tributação de prêmios de loteria no Brasil, como declarar o dinheiro e o que acontece com os rendimentos depois. O conteúdo é informativo; para o seu caso específico, consulte um contador.</p>

<h2>Quanto é descontado do prêmio</h2>
<p>A legislação determina a retenção de <strong>30% de Imposto de Renda na fonte</strong> sobre prêmios de loteria acima do limite de isenção. "Na fonte" significa que a própria Caixa desconta o imposto antes de pagar: o ganhador recebe o valor já líquido e não precisa emitir guia nem recolher nada à parte.</p>
<h3>Exemplos de cálculo</h3>
<div class="table-wrap"><table><thead><tr><th>Prêmio bruto</th><th class="num">IR retido (30%)</th><th class="num">Valor líquido</th></tr></thead><tbody>
<tr><td>R$ 100.000,00</td><td class="num">R$ 30.000,00</td><td class="num">R$ 70.000,00</td></tr>
<tr><td>R$ 10.000.000,00</td><td class="num">R$ 3.000.000,00</td><td class="num">R$ 7.000.000,00</td></tr>
<tr><td>R$ 1.000.000.000,00</td><td class="num">R$ 300.000.000,00</td><td class="num">R$ 700.000.000,00</td></tr>
</tbody></table></div>
<p>Se o prêmio for dividido entre vários ganhadores, o imposto incide sobre a parte de cada um. Faça a conta para o seu caso na <a href="/ferramentas/premio-liquido/">calculadora de prêmio líquido</a>.</p>
<h3>E os prêmios pequenos?</h3>
<p>Prêmios de valor até o limite de isenção definido pela Receita Federal não sofrem retenção. Esse limite acompanha a regra vigente do Imposto de Renda e pode mudar de um ano para outro, por isso não fixamos um valor aqui: consulte a regra atual no site da Receita ou na lotérica.</p>

<h2>Como declarar o prêmio no Imposto de Renda</h2>
<p>Mesmo com o imposto já retido, o prêmio precisa aparecer na declaração anual do ano seguinte ao recebimento. São dois lugares:</p>
<h3>1. Rendimentos sujeitos à tributação exclusiva/definitiva</h3>
<p>Informe o valor líquido recebido, com a Caixa Econômica Federal como fonte pagadora (o CNPJ consta no comprovante de pagamento). Como a tributação é "exclusiva", esse valor não se soma aos seus outros rendimentos e não gera imposto adicional.</p>
<h3>2. Bens e Direitos</h3>
<p>O dinheiro precisa aparecer onde está guardado em 31 de dezembro: saldo em conta, aplicações, imóveis ou veículos comprados com o prêmio. Isso explica o aumento do seu patrimônio e evita cair na malha fina.</p>

<h2>Prêmios de bolão</h2>
<p>No <strong>Bolão Caixa</strong>, registrado na lotérica, o imposto é retido sobre o prêmio total e cada cotista recebe sua parte líquida diretamente, com comprovante em seu nome. É a forma mais simples e segura do ponto de vista fiscal.</p>
<p>Em <strong>bolões informais</strong>, entre amigos ou colegas de trabalho, quem resgata o prêmio é o titular do bilhete. Se ele depois transferir dinheiro para os outros participantes, a Receita pode interpretar a transferência como doação — e doações estão sujeitas ao ITCMD, imposto estadual com alíquota que varia conforme o estado. Para evitar problemas, formalize o bolão por escrito antes do sorteio, com a lista de participantes e cotas, e procure orientação contábil antes de dividir um prêmio alto.</p>

<h2>E os rendimentos do prêmio?</h2>
<p>Depois de recebido, o dinheiro passa a seguir as regras normais de tributação de investimentos. Em aplicações como CDB e Tesouro Direto, por exemplo, o IR sobre o rendimento segue a tabela regressiva, que diminui conforme o prazo da aplicação. Algumas aplicações, como a poupança, têm regras próprias de isenção para pessoa física. Simule quanto um prêmio pode render na página <a href="/mega-da-virada/quanto-rende/">quanto rende R$ 1 bilhão</a>.</p>

<h2>Linha do tempo: do sorteio à declaração</h2>
<ol>
<li><strong>Dia do sorteio:</strong> confira o resultado oficial e guarde o bilhete com segurança.</li>
<li><strong>Até 90 dias depois:</strong> resgate o prêmio. O IR de 30% é retido no pagamento e o comprovante mostra os valores bruto, retido e líquido.</li>
<li><strong>Depois do resgate:</strong> aplique o dinheiro ou use conforme seu planejamento. Rendimentos futuros seguem as regras de cada aplicação.</li>
<li><strong>No ano seguinte:</strong> na declaração anual, informe o prêmio em rendimentos de tributação exclusiva e o patrimônio resultante em Bens e Direitos.</li>
</ol>
<h3>Exemplo de declaração</h3>
<p>Quem recebeu R$ 7.000.000,00 líquidos de um prêmio de R$ 10 milhões e aplicou o valor em um CDB informaria: em "Rendimentos sujeitos à tributação exclusiva", o valor do prêmio conforme o comprovante da Caixa; em "Bens e Direitos", a aplicação no banco, com o saldo em 31 de dezembro. Os rendimentos do CDB entram nas fichas próprias, conforme o informe do banco.</p>

<h2>Cuidados importantes</h2>
<ul>
<li><strong>Guarde todos os comprovantes</strong> de pagamento do prêmio — eles comprovam a origem do dinheiro.</li>
<li><strong>Não esqueça de declarar</strong> no ano seguinte, mesmo que o imposto já tenha sido retido.</li>
<li><strong>Doações a familiares</strong> também podem ter ITCMD: planeje antes de distribuir valores.</li>
<li><strong>Desconfie de cobranças</strong> de "taxas para liberar o prêmio": isso é golpe. O imposto é descontado pela própria Caixa no pagamento.</li>
</ul>
<blockquote>Este conteúdo é informativo e não substitui a orientação de um contador ou advogado tributarista.</blockquote>`,
    faq: [
      { q: 'Quanto de imposto se paga sobre prêmio de loteria?', a: 'Prêmios acima do limite de isenção têm 30% de Imposto de Renda retido na fonte pela Caixa no momento do pagamento.' },
      { q: 'Preciso pagar o imposto depois de receber?', a: 'Não. O imposto já vem descontado. Você só precisa informar o prêmio na declaração anual, em rendimentos de tributação exclusiva, e o patrimônio em Bens e Direitos.' },
      { q: 'Prêmio de bolão paga imposto duas vezes?', a: 'No Bolão Caixa, não: o IR é retido uma vez sobre o total e cada cotista recebe sua parte líquida. Em bolões informais, a divisão posterior pode ser vista como doação e ter ITCMD.' },
      { q: 'Os rendimentos do prêmio pagam imposto?', a: 'Sim, seguem as regras normais de cada aplicação financeira. Algumas, como a poupança para pessoa física, têm isenção.' },
    ],
  },
  {
    slug: 'como-fazer-bolao',
    titulo: 'Como fazer um bolão de loteria: guia completo e seguro',
    desc: 'Passo a passo para organizar um bolão: Bolão Caixa ou bolão entre amigos, divisão de cotas, registro dos jogos, conferência e divisão do prêmio.',
    resposta: 'A forma mais segura de fazer bolão é o <strong>Bolão Caixa</strong>, registrado na lotérica: cada participante recebe um recibo de cota próprio e pode resgatar sua parte do prêmio individualmente. Em bolões entre amigos, registre tudo por escrito — participantes, cotas e jogos — e compartilhe as fotos dos comprovantes antes do sorteio.',
    publicado: '2026-11-25', atualizado: '2026-11-26',
    html: `
<p>O bolão é a forma mais popular de apostar com mais números sem gastar muito: um grupo divide o custo de vários jogos (ou de jogos maiores) e, se ganhar, divide o prêmio. É também a origem de muitas brigas quando algo não foi combinado direito. Este guia mostra como organizar um bolão do começo ao fim, com segurança.</p>

<h2>Bolão Caixa ou bolão entre amigos?</h2>
<h3>Bolão Caixa (oficial)</h3>
<p>É registrado em uma lotérica ou nos canais digitais da Caixa. Cada participante recebe um <strong>recibo de cota</strong> próprio, que dá direito à sua fração do prêmio. A grande vantagem é a segurança: cada cotista resgata sua parte diretamente, sem depender do organizador, e o imposto já vem resolvido. Há regras de quantidade mínima e máxima de cotas e de valor mínimo por modalidade, e a lotérica pode cobrar uma tarifa de serviço sobre a cota — confira na hora da compra.</p>
<h3>Bolão informal</h3>
<p>Um organizador recolhe o dinheiro, faz as apostas em seu nome e, se ganhar, divide o prêmio. Funciona bem entre pessoas de confiança, mas exige cuidado: legalmente, o prêmio é pago ao portador do bilhete. Por isso, a organização e o registro são essenciais.</p>

<h2>Passo a passo para organizar o bolão</h2>
<h3>1. Defina orçamento e valor da cota</h3>
<p>Combine quanto cada pessoa vai pagar e se alguém pode comprar mais de uma cota. Cotas iguais simplificam a divisão.</p>
<h3>2. Escolha a loteria e o formato dos jogos</h3>
<p>Com o orçamento definido, decida entre muitos jogos simples ou poucos jogos com mais números. Na Mega-Sena, um jogo de 8 números custa o mesmo que 28 apostas simples e cobre exatamente essas 28 combinações — a chance é igual, mas o jogo maior garante que, se sair a quina, ela venha acompanhada de várias quadras. Use a <a href="/ferramentas/calculadora-de-bolao/">calculadora de bolão</a> para comparar custos e chances.</p>
<h3>3. Registre os participantes por escrito</h3>
<p>Uma lista com nome, valor pago e número de cotas de cada pessoa evita dúvidas. Um grupo de mensagens com a lista fixada já ajuda; para valores altos, um documento assinado é ainda melhor.</p>
<h3>4. Faça as apostas e compartilhe os comprovantes</h3>
<p>Assim que registrar os jogos, envie a foto de todos os bilhetes ao grupo, <strong>antes do sorteio</strong>. Para a Mega da Virada, o <a href="/mega-da-virada/bolao-online/">bolão online</a> do Rio de Prêmios gera um link com os jogos que confere tudo automaticamente depois do sorteio.</p>
<h3>5. Confira o resultado</h3>
<p>Use o <a href="/ferramentas/conferidor/">conferidor de apostas</a> para checar todos os jogos de uma vez. Em jogos com mais números, lembre que um mesmo jogo pode fazer várias quinas e quadras.</p>
<h3>6. Divida o prêmio conforme o combinado</h3>
<p>Divida proporcionalmente às cotas. Combine antes o que fazer com prêmios pequenos — por exemplo, reinvestir no próximo bolão em vez de dividir centavos.</p>

<h2>Exemplo prático</h2>
<p>Dez amigos, R$ 50 cada, somam R$ 500. Na Mega-Sena, isso compra, por exemplo, 2 jogos de 8 números (R$ 168 cada) e 27 apostas simples (R$ 6 cada), totalizando R$ 498. Se o grupo ganhar uma quina de R$ 50.000, cada participante recebe 1/10 do valor (antes de impostos, quando aplicáveis).</p>

<h2>Dicas para jogar melhor em grupo</h2>
<ul>
<li><strong>Evite combinações populares</strong>, como datas (números até 31) e sequências: elas dividem o prêmio com mais gente.</li>
<li><strong>Não repita jogos</strong> entre os bilhetes do mesmo bolão — isso gasta dinheiro sem aumentar a chance.</li>
<li><strong>Use números aleatórios</strong> bem espalhados: o <a href="/ferramentas/gerador-de-numeros/">gerador de números</a> ajuda.</li>
<li><strong>Defina um responsável</strong> pela compra e pela guarda dos bilhetes originais.</li>
</ul>

<h2>Erros comuns em bolões (e como evitar)</h2>
<h3>Não registrar quem pagou</h3>
<p>O problema mais frequente é descobrir, depois do sorteio, que ninguém sabe exatamente quem entrou com quanto. Uma lista simples, enviada ao grupo antes da aposta, resolve. Inclua também quem ficou de fora, para não haver dúvidas.</p>
<h3>Apostar depois do horário</h3>
<p>Cada concurso tem horário de encerramento das vendas. Se o responsável deixa para a última hora e perde o prazo, a aposta vai para o concurso seguinte — ou nem é feita. Combine um prazo interno, horas antes do encerramento oficial.</p>
<h3>Jogos repetidos ou mal digitados</h3>
<p>Dois bilhetes com a mesma combinação custam o dobro sem aumentar a chance. Antes de registrar, confira a lista de jogos; ferramentas como o gerador de números ajudam a evitar repetições.</p>
<h3>Bilhete guardado por uma só pessoa, sem foto</h3>
<p>Se o bilhete original se perder, não há prêmio. Fotografe todos, compartilhe as imagens e combine quem fica com os originais.</p>
<h3>Não combinar a divisão de prêmios pequenos</h3>
<p>Uma quadra dividida entre 20 pessoas rende poucos reais para cada uma. Decida antes se prêmios abaixo de certo valor serão reinvestidos no próximo bolão.</p>

<h2>Cuidados legais e fiscais</h2>
<p>Em bolões informais, o prêmio é pago ao titular do bilhete, que depois transfere a parte de cada um. Transferências altas podem ser interpretadas como doação, sujeita a imposto estadual. Veja o <a href="/guias/imposto-de-renda-sobre-premios-de-loteria/">guia de Imposto de Renda sobre prêmios</a> e, em caso de prêmio alto, procure um contador antes de dividir.</p>`,
    faq: [
      { q: 'Qual a forma mais segura de fazer bolão?', a: 'O Bolão Caixa, registrado na lotérica ou nos canais da Caixa: cada participante recebe seu próprio recibo de cota e resgata a sua parte diretamente.' },
      { q: 'Como dividir o prêmio do bolão?', a: 'Proporcionalmente às cotas de cada participante, conforme combinado antes do sorteio. No Bolão Caixa, a divisão é automática.' },
      { q: 'É melhor fazer muitos jogos simples ou poucos jogos grandes?', a: 'Com o mesmo valor, a chance de acertar a faixa principal é praticamente igual. Jogos com mais números concentram prêmios secundários quando acertam.' },
      { q: 'O bolão aumenta a chance de ganhar?', a: 'Aumenta a chance do grupo, porque há mais combinações em jogo. A chance por real investido é a mesma de uma aposta individual.' },
    ],
  },
  {
    slug: 'como-resgatar-premio-da-loteria',
    titulo: 'Como resgatar prêmio da loteria: prazos, locais e documentos',
    desc: 'Onde e como receber prêmios de loteria: lotéricas, agências da Caixa e apostas online, prazo de 90 dias, documentos e cuidados de segurança.',
    resposta: 'O prazo para resgatar qualquer prêmio de loteria é de <strong>90 dias corridos</strong> após o sorteio. Prêmios menores podem ser recebidos em lotéricas; prêmios maiores são pagos em agências da Caixa, com o bilhete original e documento de identificação com CPF. Depois do prazo, o valor não resgatado é repassado ao FIES.',
    publicado: '2026-11-25', atualizado: '2026-11-26',
    html: `
<p>Acertou os números? Antes de qualquer coisa, respire e siga um roteiro seguro. Este guia explica onde receber o prêmio, quais documentos levar, quanto tempo você tem e como se proteger de golpes — tanto para apostas feitas na lotérica quanto pela internet.</p>

<h2>Primeiro passo: confira e proteja o bilhete</h2>
<ul>
<li><strong>Confira o resultado oficial</strong> no site ou app da Caixa, ou na lotérica. Você também pode usar o <a href="/ferramentas/conferidor/">conferidor de apostas</a> do Rio de Prêmios para uma checagem rápida.</li>
<li><strong>Assine o verso do bilhete</strong>, se for físico, e guarde-o em local seguro, longe de umidade e calor.</li>
<li><strong>Fotografe frente e verso</strong>.</li>
<li><strong>Não divulgue</strong> o bilhete premiado nas redes sociais nem para desconhecidos.</li>
</ul>

<h2>Onde receber o prêmio</h2>
<h3>Lotéricas</h3>
<p>As casas lotéricas pagam prêmios até um valor-limite definido pela Caixa. É o caminho mais rápido para prêmios pequenos: basta apresentar o bilhete premiado e, conforme o valor, um documento de identificação.</p>
<h3>Agências da Caixa</h3>
<p>Prêmios acima do limite das lotéricas são pagos exclusivamente nas agências da Caixa. Para valores altos, o banco oferece atendimento reservado e orientação financeira. Leve o bilhete original e os documentos pessoais. O pagamento costuma ser feito por crédito em conta ou transferência, e não em dinheiro vivo.</p>
<h3>Apostas pela internet</h3>
<p>Quem aposta pelo app Loterias Caixa ou pelo portal Loterias Online tem o comprovante digital vinculado ao cadastro. Prêmios menores podem ser creditados na conta indicada no cadastro; prêmios maiores seguem o procedimento de resgate em agência. Mantenha seus dados de cadastro atualizados.</p>

<h2>Documentos necessários</h2>
<ul>
<li>Bilhete original, sem rasuras, ou comprovante da aposta digital;</li>
<li>Documento oficial de identificação com foto;</li>
<li>CPF;</li>
<li>Para prêmios em bolão oficial, o recibo da cota.</li>
</ul>
<p>Prêmios de bolões informais são pagos ao portador do bilhete. Veja como organizar a divisão no <a href="/guias/como-fazer-bolao/">guia de bolão</a>.</p>

<h2>Prazo: 90 dias corridos</h2>
<p>O prazo para resgatar é de <strong>90 dias corridos a partir da data do sorteio</strong>, contando fins de semana e feriados. Se o último dia cair em data sem expediente bancário, confirme o procedimento com a Caixa com antecedência. Depois do prazo, o prêmio prescreve e o valor é repassado ao FIES (Fundo de Financiamento Estudantil).</p>

<h2>Passo a passo no dia do resgate</h2>
<ol>
<li><strong>Confirme o valor</strong> do prêmio no resultado oficial do concurso, que informa quanto cada faixa pagou.</li>
<li><strong>Verifique onde receber</strong>: se o valor estiver dentro do limite das lotéricas, vá a uma lotérica; acima dele, procure uma agência da Caixa. Na dúvida, pergunte na própria lotérica, que confere o bilhete na hora.</li>
<li><strong>Leve os documentos</strong>: bilhete original, documento oficial com foto e CPF. Para crédito em conta, tenha os dados bancários em mãos.</li>
<li><strong>Confira o comprovante</strong> de pagamento, que mostra o valor bruto, o imposto retido e o valor líquido. Guarde-o: ele é necessário na declaração de Imposto de Renda.</li>
<li><strong>Planeje o próximo passo</strong>: em prêmios altos, deixe o dinheiro em uma aplicação segura até decidir com calma o que fazer.</li>
</ol>
<p>Se o bilhete for de um bolão informal, combine com o grupo, antes de ir ao banco, como e quando será feita a divisão.</p>

<h2>Impostos</h2>
<p>Prêmios acima do limite de isenção têm 30% de Imposto de Renda retido na fonte: você recebe o valor líquido. Saiba como declarar no <a href="/guias/imposto-de-renda-sobre-premios-de-loteria/">guia de Imposto de Renda sobre prêmios</a> e calcule o líquido na <a href="/ferramentas/premio-liquido/">calculadora de prêmio líquido</a>.</p>

<h2>Ganhei um prêmio alto: e agora?</h2>
<h3>Mantenha discrição</h3>
<p>Conte para poucas pessoas de confiança. Exposição atrai pedidos de dinheiro e golpes.</p>
<h3>Não tome decisões apressadas</h3>
<p>Antes de pedir demissão, comprar imóveis ou emprestar dinheiro, deixe o valor aplicado com segurança e procure orientação de profissionais independentes: contador, advogado e planejador financeiro.</p>
<h3>Planeje doações e partilhas</h3>
<p>Transferências para familiares podem ter imposto estadual sobre doações. Planeje antes de distribuir valores.</p>

<h2>Bilhete danificado, perdido ou molhado</h2>
<p>O bilhete físico é o documento que comprova a aposta. Se ele for danificado, procure uma agência da Caixa o quanto antes, levando o que restou do bilhete e a foto, se tiver: a análise é feita caso a caso, e bilhetes ilegíveis ou rasurados podem ser recusados. Para evitar o problema:</p>
<ul>
<li>guarde o bilhete em um envelope ou plástico, longe de calor, sol e umidade;</li>
<li>não plastifique nem cole fita adesiva sobre a impressão;</li>
<li>fotografe frente e verso logo após a aposta;</li>
<li>se possível, prefira apostar pelo app ou pelo portal da Caixa, onde o comprovante fica vinculado ao seu cadastro.</li>
</ul>
<p>Em bolões oficiais, cada cotista tem seu recibo de cota; a perda de um recibo não afeta os demais participantes.</p>

<h2>Cuidado com golpes</h2>
<ul>
<li>A Caixa não cobra taxa para liberar prêmio: qualquer pedido de pagamento antecipado é golpe.</li>
<li>Desconfie de ligações, mensagens ou perfis que dizem que você ganhou sem ter apostado.</li>
<li>Nunca entregue o bilhete original a terceiros para "resgatar por você".</li>
<li>Use apenas os canais oficiais da Caixa.</li>
</ul>`,
    faq: [
      { q: 'Qual o prazo para resgatar prêmio da loteria?', a: '90 dias corridos a partir da data do sorteio. Depois disso, o prêmio prescreve e o valor vai para o FIES.' },
      { q: 'Onde recebo prêmio alto da Mega-Sena?', a: 'Em agências da Caixa, com o bilhete original, documento de identificação com foto e CPF. Prêmios menores podem ser pagos nas lotéricas.' },
      { q: 'Apostei pela internet. Como recebo?', a: 'Prêmios menores podem ser creditados na conta cadastrada; prêmios maiores seguem o resgate em agência da Caixa.' },
      { q: 'Posso perder o prêmio se o bilhete estiver rasurado?', a: 'Bilhetes danificados ou rasurados podem ser recusados. Guarde o bilhete com cuidado e fotografe frente e verso logo após a aposta.' },
    ],
  },

  {
    slug: 'horario-dos-sorteios-das-loterias',
    titulo: 'Horário dos sorteios das loterias da Caixa: dias e onde assistir',
    desc: 'Que horas sai o resultado da Mega-Sena, Lotofácil, Quina e demais loterias, em que dias da semana cada uma sorteia, onde assistir ao vivo e até que horas dá para apostar.',
    resposta: 'Os sorteios das loterias da Caixa acontecem normalmente às <strong>20h (horário de Brasília)</strong>, no Espaço da Sorte, em São Paulo, com transmissão ao vivo pelos canais oficiais da Caixa. A Lotofácil e a Quina sorteiam de segunda a sábado; a Mega-Sena, às terças, quintas e sábados. As apostas costumam encerrar às 19h do dia do sorteio.',
    publicado: '2026-11-27', atualizado: '2026-11-27',
    html: `
<p>Saber o dia e o horário de cada sorteio é o primeiro passo para não perder o prazo da aposta e para conferir o resultado assim que ele sai. Este guia reúne o calendário semanal de todas as loterias da Caixa, explica onde assistir aos sorteios e até que horas é possível apostar.</p>
<h2>Calendário semanal dos sorteios</h2>
<p>Todas as loterias abaixo têm sorteio às 20h, horário de Brasília, nos dias indicados. Em feriados e concursos especiais, a Caixa pode alterar datas e horários — como na Mega da Virada 2026, que será sorteada em 1º de janeiro de 2027, às 11h.</p>
${tabelaHorarios}
<h3>Quais loterias sorteiam em cada dia</h3>
<ul>
<li><strong>Segunda, quarta e sexta:</strong> Lotofácil, Quina, Lotomania, Dupla Sena e Super Sete.</li>
<li><strong>Terça, quinta e sábado:</strong> Lotofácil, Quina, Mega-Sena, Timemania e Dia de Sorte.</li>
<li><strong>Quarta e sábado:</strong> também a +Milionária.</li>
</ul>
<p>Ou seja: todos os dias de segunda a sábado há sorteio de pelo menos quatro loterias. Aos domingos, em geral, não há sorteios das loterias da Caixa.</p>
<h2>Onde os sorteios acontecem e como assistir</h2>
<p>Os sorteios são realizados no <strong>Espaço da Sorte</strong>, em São Paulo, e transmitidos ao vivo pelos canais oficiais da Caixa nas redes sociais. A transmissão é pública, e qualquer pessoa pode acompanhar a extração dos números em tempo real.</p>
<p>Se não puder assistir, acompanhe por aqui: o Rio de Prêmios verifica os resultados automaticamente e publica cada concurso poucos minutos depois do sorteio, com as dezenas, a premiação e os ganhadores por cidade. A página do próximo concurso de cada loteria já fica no ar antes do sorteio — por exemplo, a do <a href="/mega-sena/">próximo concurso da Mega-Sena</a>.</p>
<h2>Até que horas dá para apostar</h2>
<p>Em geral, as apostas para o concurso do dia são aceitas até as <strong>19h (horário de Brasília)</strong>, uma hora antes do sorteio, nas lotéricas, no aplicativo Loterias Caixa e no portal Loterias Online. Depois desse horário, a aposta é registrada para o concurso seguinte. Em concursos especiais, os prazos são divulgados separadamente — na Mega da Virada 2026, por exemplo, as apostas individuais vão até as 22h de 31 de dezembro.</p>
<h3>Dicas para não perder o prazo</h3>
<ul>
<li>Aposte com antecedência, principalmente em concursos acumulados, quando as filas e o tráfego no app aumentam.</li>
<li>Pelo app, confira no comprovante o número do concurso para o qual a aposta foi registrada.</li>
<li>Use a <strong>Teimosinha</strong>, disponível nos canais da Caixa, para repetir a mesma aposta em concursos seguidos sem precisar voltar todo dia.</li>
</ul>
<h2>Que horas o resultado é divulgado</h2>
<p>As dezenas são conhecidas no momento do sorteio, a partir das 20h. O rateio — quantos ganhadores houve em cada faixa e quanto cada um recebe — é publicado pela Caixa logo em seguida e pode ser complementado nas horas seguintes, com a lista de cidades dos ganhadores. Nossas páginas de concurso se atualizam automaticamente quando essas informações chegam.</p>
<h2>Resultados de hoje</h2>
<p>Veja o último resultado de cada loteria: ${LOTERIAS.map((l) => `<a href="/${l.slug}/">${l.nome}</a>`).join(' · ')}.</p>`,
    faq: [
      { q: 'Que horas sai o resultado da Mega-Sena?', a: 'O sorteio da Mega-Sena acontece às 20h (horário de Brasília), às terças, quintas e sábados. O resultado aparece no site poucos minutos depois.' },
      { q: 'Que horas sai o resultado da Lotofácil?', a: 'A Lotofácil sorteia de segunda a sábado, às 20h (horário de Brasília).' },
      { q: 'Até que horas posso apostar no dia do sorteio?', a: 'Em geral, até as 19h (horário de Brasília). Depois disso, a aposta vale para o próximo concurso.' },
      { q: 'Tem sorteio de loteria no domingo?', a: 'Em geral, não há sorteios das loterias da Caixa aos domingos. O Rio de Prêmios, loteria do Estado do RJ, sorteia aos domingos.' },
    ],
  },
  {
    slug: 'precos-das-loterias',
    titulo: 'Preços das loterias da Caixa em 2026: quanto custa cada aposta',
    desc: 'Tabela atualizada com o preço da aposta mínima e máxima de todas as loterias da Caixa em 2026 — Mega-Sena, Lotofácil, Quina, +Milionária e outras — e como o preço muda com mais números.',
    resposta: 'Em 2026, a aposta mínima custa <strong>R$ 6,00 na Mega-Sena e na +Milionária</strong>, <strong>R$ 3,50 na Lotofácil e na Timemania</strong>, <strong>R$ 3,00 na Quina, Lotomania, Dupla Sena e Super Sete</strong> e <strong>R$ 2,50 no Dia de Sorte</strong>. São os valores em vigor desde o reajuste de julho de 2025.',
    publicado: '2026-11-27', atualizado: '2026-11-27',
    html: `
<p>O preço de uma aposta depende da loteria e de quantos números você marca. Esta tabela reúne os valores de todas as modalidades da Caixa, da aposta mais barata à mais cara, com a chance de ganhar o prêmio principal em cada uma. Os preços são os da tabela vigente desde o reajuste de julho de 2025 — confira sempre os valores nos canais oficiais antes de apostar.</p>
<h2>Tabela de preços de todas as loterias</h2>
${tabelaPrecos}
<p>A coluna "aposta máxima" mostra o valor com o maior número de dezenas permitido. Na Lotomania e na Timemania, o número de dezenas é fixo, então só existe um preço.</p>
<h2>Como o preço cresce com mais números</h2>
<p>Nas loterias em que você escolhe quantos números marcar, cada número a mais transforma a aposta em várias apostas simples. O preço é o valor da aposta mínima multiplicado pelo número de combinações formadas:</p>
<ul>
<li><strong>Mega-Sena:</strong> 7 números = ${brl(custo(POR_SLUG['mega-sena'], 7))}; 8 números = ${brl(custo(POR_SLUG['mega-sena'], 8))}; 10 números = ${brl(custo(POR_SLUG['mega-sena'], 10))}. Veja a tabela completa em <a href="/mega-da-virada/quanto-custa-apostar/">quanto custa apostar na Mega</a>.</li>
<li><strong>Lotofácil:</strong> 16 números = ${brl(custo(LF, 16))}; 17 números = ${brl(custo(LF, 17))}; 18 números = ${brl(custo(LF, 18))}.</li>
<li><strong>Quina:</strong> 6 números = ${brl(custo(POR_SLUG['quina'], 6))}; 7 números = ${brl(custo(POR_SLUG['quina'], 7))}.</li>
<li><strong>+Milionária:</strong> o preço considera números e trevos: 7 números com 2 trevos = ${brl(custo(POR_SLUG['mais-milionaria'], 7, 2))}; 6 números com 3 trevos = ${brl(custo(POR_SLUG['mais-milionaria'], 6, 3))}.</li>
</ul>
<p>A chance de ganhar cresce exatamente na mesma proporção do preço: não há "desconto" em apostas maiores. Simule qualquer combinação na <a href="/ferramentas/calculadora-de-probabilidades/">calculadora de probabilidades</a>.</p>
<h2>Qual loteria tem o melhor custo-benefício?</h2>
<p>Depende do objetivo. Para ter mais chance de ganhar o prêmio principal gastando pouco, o Dia de Sorte e a Lotofácil são as mais acessíveis. Para concorrer a prêmios milionários, a Mega-Sena e a +Milionária concentram os maiores valores, mas com chances muito menores. O <a href="/guias/qual-loteria-tem-mais-chance-de-ganhar/">ranking de chances</a> compara todas as modalidades.</p>
<h2>Bolões: apostas maiores por menos</h2>
<p>Quem quer jogar com mais números sem pagar sozinho pode participar de um bolão. No Bolão Caixa, vendido nas lotéricas, cada participante compra uma cota de um conjunto de apostas — e a lotérica pode cobrar uma tarifa de serviço sobre a cota. Calcule o valor de cada cota na <a href="/ferramentas/calculadora-de-bolao/">calculadora de bolão</a> e leia o <a href="/guias/como-fazer-bolao/">guia completo de bolão</a>.</p>
<h2>Onde comprar</h2>
<p>As apostas podem ser feitas em casas lotéricas, no aplicativo Loterias Caixa, no portal Loterias Online e no internet banking da Caixa. Apostas pela internet exigem cadastro e maioridade, e os canais digitais costumam ter um valor mínimo por compra.</p>`,
    faq: [
      { q: 'Quanto custa a aposta mínima da Mega-Sena em 2026?', a: 'R$ 6,00, com 6 números.' },
      { q: 'Quanto custa jogar na Lotofácil?', a: `A aposta mínima, com 15 números, custa R$ 3,50. Com 16 números, ${brl(custo(LF, 16))}; com 20 números, ${brl(custo(LF, 20))}.` },
      { q: 'Qual a loteria mais barata da Caixa?', a: 'O Dia de Sorte, com aposta mínima de R$ 2,50.' },
      { q: 'Quando foi o último reajuste das loterias?', a: 'Os valores atuais estão em vigor desde o reajuste de julho de 2025.' },
    ],
  },
  {
    slug: 'como-aumentar-as-chances-na-lotofacil',
    titulo: 'Como aumentar as chances na Lotofácil: o que funciona e o que é mito',
    desc: 'O que realmente muda sua chance na Lotofácil — mais números, bolões, padrões dos sorteios — e quais "estratégias" são mito. Com probabilidades exatas calculadas.',
    resposta: 'Na Lotofácil, só duas coisas aumentam a chance de ganhar: <strong>marcar mais números</strong> e <strong>fazer mais apostas</strong> (sozinho ou em bolão) — e as duas custam proporcionalmente mais. Com uma aposta simples de 15 números, a chance dos 15 pontos é de 1 em 3.268.760, e a de ganhar algum prêmio (11 acertos ou mais) é de cerca de 1 em 9. Números "atrasados", sequências da sorte e robôs não mudam a probabilidade.',
    publicado: '2026-11-27', atualizado: '2026-11-27',
    html: `
<p>A Lotofácil é a loteria em que mais gente ganha alguma coisa, e por isso é cercada de dicas, "métodos" e promessas. Este guia separa o que tem base matemática do que é mito, usando as probabilidades exatas de cada situação.</p>
<h2>As chances reais da Lotofácil</h2>
<p>Você marca 15 números entre 25, e o sorteio também escolhe 15. Como você cobre mais da metade do volante, a Lotofácil tem chances muito melhores que a Mega-Sena:</p>
<ul>
<li><strong>15 acertos:</strong> 1 em ${n0(chance(probabilidade(LF, 15)))}</li>
<li><strong>14 acertos:</strong> 1 em ${n0(chance(probabilidade(LF, 14)))}</li>
<li><strong>13 acertos:</strong> 1 em ${n0(chance(probabilidade(LF, 13)))}</li>
<li><strong>12 acertos:</strong> 1 em ${n0(chance(probabilidade(LF, 12)))}</li>
<li><strong>11 acertos:</strong> 1 em ${n0(chance(probabilidade(LF, 11)))}</li>
<li><strong>Algum prêmio (11 a 15):</strong> cerca de 1 em ${n0(1 / lf11())}</li>
</ul>
<h2>O que realmente aumenta a chance</h2>
<h3>1. Marcar mais números</h3>
<p>É possível marcar de 15 a 20 números. Cada número a mais multiplica as combinações cobertas — e o preço:</p>
${tabelaLF}
<p>Repare que o preço e a chance crescem juntos: um jogo de 16 números custa 16 vezes mais e tem 16 vezes mais chance de 15 pontos. Não existe atalho.</p>
<h3>2. Fazer mais apostas — de preferência em bolão</h3>
<p>Mais apostas diferentes significam mais combinações em jogo. Em grupo, o bolão permite jogar com 17, 18 ou mais números dividindo o custo. Monte o seu com a <a href="/ferramentas/calculadora-de-bolao/">calculadora de bolão</a>.</p>
<h2>Padrões que ajudam a montar jogos "típicos"</h2>
<p>Algumas características se repetem nos sorteios da Lotofácil não por mistério, mas por pura matemática. Elas não aumentam a chance de uma combinação específica, mas ajudam a entender como são os resultados mais comuns:</p>
<ul>
<li><strong>Pares e ímpares:</strong> entre 1 e 25 há 12 números pares e 13 ímpares. Em média, um sorteio tem cerca de 7 pares e 8 ímpares — combinações muito desequilibradas são raras.</li>
<li><strong>Repetidos do concurso anterior:</strong> como saem 15 de 25 números, em média <strong>9 dezenas se repetem</strong> de um concurso para o seguinte.</li>
<li><strong>Moldura e miolo:</strong> no volante 5×5, a borda tem 16 números e o centro, 9. Em média, cerca de 9 ou 10 dezenas sorteadas estão na moldura.</li>
</ul>
<p>Veja esses números de cada concurso nas análises automáticas das páginas de resultado e nas <a href="/lotofacil/estatisticas/">estatísticas da Lotofácil</a>.</p>
<h2>Mitos que não funcionam</h2>
<h3>"Jogue nas dezenas atrasadas"</h3>
<p>Uma dezena que não sai há vários concursos não fica "devendo". Os sorteios são independentes: a chance de cada número sair é sempre 15 em 25, ou 60%, em todo concurso.</p>
<h3>"Use as dezenas que mais saem"</h3>
<p>As diferenças de frequência entre as dezenas são as esperadas pelo acaso. Elas descrevem o passado, mas não preveem o próximo sorteio.</p>
<h3>"Robôs e aplicativos que acertam a Lotofácil"</h3>
<p>Nenhum programa consegue prever um sorteio aleatório. Desconfie de quem cobra por "jogos garantidos" — se funcionasse, o vendedor não precisaria vender.</p>
<h3>"Fechamentos garantem prêmio"</h3>
<p>Fechamentos garantem um prêmio mínimo <em>somente se</em> uma parte das dezenas sorteadas estiver entre os números escolhidos — uma condição que nem sempre acontece. Entenda como funcionam no guia <a href="/guias/fechamentos-e-desdobramentos/">fechamentos e desdobramentos</a>.</p>
<h2>Como jogar melhor (sem gastar mais)</h2>
<ul>
<li><strong>Evite combinações muito populares</strong>, como desenhos no volante: se ganhar, divide o prêmio de 14 e 15 pontos com menos gente.</li>
<li><strong>Não repita a mesma combinação</strong> em bilhetes diferentes do mesmo bolão.</li>
<li><strong>Defina um orçamento</strong> e mantenha-se nele. A faixa de 11 acertos tem prêmio pequeno: ela não "paga" o jogo.</li>
<li>Gere jogos equilibrados no <a href="/ferramentas/gerador-de-numeros/">gerador de números</a>.</li>
</ul>`,
    faq: [
      { q: 'Qual a chance de ganhar na Lotofácil?', a: `Com 15 números, 1 em ${n0(chance(probabilidade(LF, 15)))} para 15 pontos e cerca de 1 em ${n0(1 / lf11())} para ganhar algum prêmio (11 acertos ou mais).` },
      { q: 'Jogar com 16 números vale a pena?', a: `Custa ${brl(custo(LF, 16))} e aumenta a chance de 15 pontos em 16 vezes. A vantagem é igual ao aumento de custo; em bolão, o valor fica mais acessível.` },
      { q: 'Quantos números costumam repetir do concurso anterior?', a: 'Em média 9, pela própria matemática: saem 15 de 25 números a cada concurso.' },
      { q: 'Existe estratégia garantida na Lotofácil?', a: 'Não. Só mais números ou mais apostas aumentam a chance, e ambos custam proporcionalmente mais.' },
    ],
  },
  {
    slug: 'fechamentos-e-desdobramentos',
    titulo: 'Fechamentos e desdobramentos na loteria: o que são e quando valem a pena',
    desc: 'Entenda a diferença entre desdobramento e fechamento, quanto custam, o que realmente garantem e um exemplo prático calculado na Mega-Sena.',
    resposta: '<strong>Desdobramento</strong> é dividir um jogo com mais números em todas as apostas simples possíveis — custa o mesmo que marcar esses números num só jogo. <strong>Fechamento</strong> é usar só parte dessas combinações, escolhidas para garantir um prêmio mínimo <em>se</em> certa quantidade das dezenas sorteadas estiver entre os seus números. O fechamento economiza, mas a garantia é condicional.',
    publicado: '2026-11-27', atualizado: '2026-11-28',
    html: `
<p>"Fechamento" e "desdobramento" são termos muito usados por apostadores experientes e por quem organiza bolões. Eles prometem cobrir mais números gastando menos — mas é importante entender exatamente o que garantem. Neste guia explicamos os dois conceitos com um exemplo calculado na Mega-Sena.</p>
<h2>O que é desdobramento</h2>
<p>Desdobrar é pegar um conjunto de números maior que a aposta mínima e transformá-lo em <strong>todas</strong> as apostas simples possíveis. Na Mega-Sena, 7 números geram ${C(7, 6)} combinações de 6; 8 números geram ${C(8, 6)}; 10 números geram ${C(10, 6)}.</p>
<p>Na prática, um desdobramento completo é idêntico a marcar todos os números em um único jogo: o volante da Caixa já faz isso automaticamente e cobra o mesmo valor (R$ 6,00 por combinação). A chance de ganhar é exatamente a mesma. A diferença é só de organização — por exemplo, para distribuir as combinações entre bilhetes de um bolão.</p>
<h2>O que é fechamento</h2>
<p>Um fechamento usa <strong>apenas uma parte</strong> das combinações de um desdobramento, escolhidas de forma a garantir um prêmio mínimo sob uma condição. A condição costuma ser descrita assim: "garante a quadra se 4 das dezenas sorteadas estiverem entre os seus números".</p>
<p>O fechamento é mais barato que o desdobramento completo, mas tem duas limitações:</p>
<ul>
<li>A garantia só vale se a condição acontecer — e, na maioria dos concursos, ela não acontece.</li>
<li>Como há menos combinações em jogo, a chance de acertar a faixa principal diminui na mesma proporção.</li>
</ul>
<h2>Exemplo calculado na Mega-Sena</h2>
<p>Suponha que você escolheu 7 números. O desdobramento completo tem ${C(7, 6)} apostas (${brl(custo(POR_SLUG['mega-sena'], 7))}). Cada uma dessas apostas deixa de fora exatamente um dos seus 7 números.</p>
<h3>Quantas apostas garantem a quadra?</h3>
<p>Imagine que 4 dos 6 números sorteados estão entre os seus 7. Uma aposta contém os 4 acertos sempre que o número que ela deixou de fora <em>não</em> é um deles. Se você jogar só 4 das 7 apostas, pode dar o azar de os 4 números deixados de fora serem justamente os 4 acertos — e nenhuma aposta teria a quadra. Com <strong>5 apostas</strong>, isso é impossível: entre os 5 números deixados de fora, no máximo 4 são acertos, então pelo menos uma aposta contém os 4. Esse é um fechamento de 5 apostas (${brl(5 * 6)}) que <strong>garante a quadra se 4 das dezenas sorteadas estiverem entre os seus 7 números</strong> — economizando ${brl(12)} em relação ao desdobramento completo.</p>
<h3>O que você perde</h3>
<p>Com 5 em vez de 7 apostas, a chance de sena cai de 7 para 5 combinações. E, quando a condição acontece, o desdobramento completo daria 3 quadras (${C(4, 4) * C(3, 2)}), enquanto o fechamento pode dar menos. É uma troca entre custo e cobertura, não um ganho gratuito.</p>
<h2>Quando um fechamento vale a pena</h2>
<ul>
<li>Em <strong>bolões</strong>, para cobrir um conjunto maior de números com orçamento limitado.</li>
<li>Quando você entende e aceita que a garantia é condicional.</li>
<li>Quando o fechamento vem com a condição explicada de forma clara. Desconfie de quem anuncia "prêmio garantido" sem dizer a condição.</li>
</ul>
<h2>Fechamentos na Lotofácil</h2>
<p>Na Lotofácil, fechamentos são populares porque muitas das 15 sorteadas costumam cair dentro de um conjunto de 18 ou 19 números. Mas a condição clássica — as 15 sorteadas <em>todas</em> entre as suas 18 — acontece em cerca de 1 em 4.006 sorteios. Um fechamento de 24 jogos com 18 dezenas garante 14 pontos nesse caso; monte o seu, com as chances exatas de cada faixa, no <a href="/lotofacil/fechamento/">gerador de fechamentos da Lotofácil</a> (há também o da <a href="/mega-sena/fechamento/">Mega-Sena</a>). O princípio é o mesmo: a garantia depende de quantas dezenas sorteadas estiverem no seu conjunto. Veja as chances reais no guia <a href="/guias/como-aumentar-as-chances-na-lotofacil/">como aumentar as chances na Lotofácil</a>.</p>
<h2>Ferramentas úteis</h2>
<p>Calcule o custo e a chance de qualquer aposta na <a href="/ferramentas/calculadora-de-probabilidades/">calculadora de probabilidades</a>, divida o custo com amigos na <a href="/ferramentas/calculadora-de-bolao/">calculadora de bolão</a> e confira vários jogos de uma vez no <a href="/ferramentas/conferidor/">conferidor</a>.</p>`,
    faq: [
      { q: 'Qual a diferença entre fechamento e desdobramento?', a: 'O desdobramento usa todas as combinações dos números escolhidos; o fechamento usa só parte delas, garantindo um prêmio mínimo apenas se certa quantidade das dezenas sorteadas estiver entre os seus números.' },
      { q: 'Fechamento garante prêmio?', a: 'Só sob a condição informada, por exemplo, "se 4 dos números sorteados estiverem entre os seus". Se a condição não acontecer, não há garantia.' },
      { q: 'Desdobramento aumenta a chance?', a: 'Tanto quanto marcar os mesmos números num só jogo. O custo também é o mesmo.' },
      { q: 'Quantas apostas garantem a quadra com 7 números na Mega-Sena?', a: '5 das 7 combinações garantem a quadra, desde que 4 das dezenas sorteadas estejam entre os seus 7 números.' },
    ],
  },
];
export const POR_GUIA = Object.fromEntries(GUIAS.map((g) => [g.slug, g]));
