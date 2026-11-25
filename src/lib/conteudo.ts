import { diasTexto, type Loteria } from './loterias';
import { probabilidade, chance, custo, C } from './math';
import { numero, reais } from './format';

export function chancePrincipal(l: Loteria) {
  if (l.tipo === 'trevos') return chance(probabilidade(l, 6, 6, 2, 2));
  return chance(probabilidade(l, l.faixas[0].acertos));
}

export function comoJogar(l: Loteria): string[] {
  const base: Record<string, string[]> = {
    padrao: [
      `Marque de ${l.escolhaMin} a ${l.escolhaMax} números entre ${l.min} e ${l.max} no volante, no app Loterias Caixa ou no site oficial.`,
      `A aposta simples, com ${l.escolhaMin} números, custa ${reais(l.preco)}. Cada número a mais aumenta o custo e as chances, porque a aposta passa a valer por várias combinações.`,
      `São sorteadas ${l.sorteadas} dezenas${l.slug === 'dupla-sena' ? ' em cada um dos dois sorteios' : ''}. Você ganha acertando ${l.faixas.map((f) => f.acertos).join(', ')} números.`,
    ],
    fixo: [
      `Marque exatamente ${l.escolhaMin} números entre ${String(l.min).padStart(2, '0')} e ${l.max}${l.extra ? ` e escolha seu ${l.extra}` : ''}.`,
      `Cada aposta custa ${reais(l.preco)}. Nesta modalidade não é possível marcar mais números — para aumentar as chances, faça mais apostas ou participe de bolões.`,
      `São sorteadas ${l.sorteadas} dezenas. Há prêmio para ${l.faixas.map((f) => f.label.toLowerCase()).join(', ')}.`,
    ],
    colunas: [
      'O volante tem 7 colunas, cada uma com números de 0 a 9. Escolha pelo menos um número em cada coluna.',
      `A aposta mínima (7 números, um por coluna) custa ${reais(l.preco)}. É possível marcar até 21 números (no máximo 3 por coluna); o preço é multiplicado pelas combinações formadas.`,
      'O sorteio define um número para cada coluna. Você ganha acertando 3, 4, 5, 6 ou 7 colunas.',
    ],
    trevos: [
      `Marque de 6 a 12 números entre 1 e 50 e de 2 a 6 trevos numerados de 1 a 6.`,
      `A aposta simples (6 números + 2 trevos) custa ${reais(l.preco)}. Mais números ou trevos multiplicam o valor pelas combinações.`,
      'São sorteados 6 números e 2 trevos. São 10 faixas de premiação, da principal (6 números + 2 trevos) até 2 números + 1 trevo.',
    ],
  };
  return base[l.tipo];
}

/** Linhas da tabela de custo x chance da faixa principal (modalidades com número variável de dezenas). */
export function tabelaCusto(l: Loteria) {
  if (l.tipo === 'fixo' || l.tipo === 'colunas') return [];
  const out: { n: number; custo: number; chance: number }[] = [];
  for (let n = l.escolhaMin; n <= l.escolhaMax; n++) {
    const p = l.tipo === 'trevos' ? probabilidade(l, 6, n, 2, 2) : probabilidade(l, l.faixas[0].acertos, n);
    out.push({ n, custo: custo(l, n), chance: chance(p) });
  }
  return out;
}

export function tabelaChances(l: Loteria) {
  return l.faixas.map((f) => ({
    label: f.label,
    chance: chance(l.tipo === 'trevos' ? probabilidade(l, f.acertos, 6, 2, f.trevos) : probabilidade(l, f.acertos)),
  }));
}

export function faqLoteria(l: Loteria) {
  const cp = chancePrincipal(l);
  const itens = [
    { q: `Que dia sai o resultado da ${l.nome}?`, a: `Os sorteios da ${l.nome} acontecem às ${diasTexto(l)}, normalmente às 20h (horário de Brasília). O Rio de Prêmios publica o resultado automaticamente poucos minutos depois.` },
    { q: `Quanto custa apostar na ${l.nome}?`, a: `A aposta mínima custa ${reais(l.preco)}.${l.tipo === 'padrao' ? ` Com ${l.escolhaMax} números (o máximo), a aposta custa ${reais(custo(l, l.escolhaMax))}.` : ''}` },
    { q: `Qual a chance de ganhar na ${l.nome}?`, a: `Com a aposta mínima, a chance de acertar a faixa principal é de 1 em ${numero(cp)}. Veja a tabela completa de probabilidades por faixa nesta página.` },
    { q: `Como jogar na ${l.nome}?`, a: comoJogar(l).join(' ') },
  ];
  if (l.slug === 'mega-sena') itens.push({ q: 'O que acontece se ninguém acertar a Mega-Sena?', a: 'O prêmio principal acumula para o próximo concurso. A exceção é a Mega da Virada (31/12), que não acumula: se não houver acertador das seis dezenas, o prêmio é dividido entre quem acertou cinco.' });
  if (l.tipo === 'fixo' && l.slug === 'lotomania') itens.push({ q: 'É verdade que errar tudo na Lotomania dá prêmio?', a: 'Sim. Quem não acerta nenhuma das 20 dezenas sorteadas também é premiado, em uma faixa própria.' });
  return itens;
}

export { C };
