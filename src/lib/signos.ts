// Palpites da Mega da Virada por signo — conteúdo de entretenimento.
// Os números são gerados de forma determinística (signo + ano): o mesmo signo sempre vê o mesmo jogo nesta edição.
import { hashSeed } from './compartilhar';
import { VIRADA } from './loterias';

export interface Signo {
  slug: string; nome: string; emoji: string; periodo: string; elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água'; regente: string;
  perfil: string; estilo: string;
}

export const SIGNOS: Signo[] = [
  { slug: 'aries', nome: 'Áries', emoji: '♈', periodo: '21/03 a 19/04', elemento: 'Fogo', regente: 'Marte',
    perfil: 'Na tradição astrológica, Áries é o signo da iniciativa: quem nasce sob ele costuma agir primeiro e pensar depois, adora desafios e não tem paciência para esperar.',
    estilo: 'Para o ariano, a dica é canalizar o impulso: decida o valor da aposta antes de abrir o app e não aumente no calor do momento. Um jogo simples, feito cedo, combina com a energia do signo.' },
  { slug: 'touro', nome: 'Touro', emoji: '♉', periodo: '20/04 a 20/05', elemento: 'Terra', regente: 'Vênus',
    perfil: 'Taurinos são associados à estabilidade, ao conforto e ao gosto por segurança financeira. Gostam de planejar e raramente se arriscam sem pensar.',
    estilo: 'O perfil taurino combina com bolões bem organizados: custo dividido, regras claras e comprovantes guardados. Defina um teto de gasto e mantenha-se nele.' },
  { slug: 'gemeos', nome: 'Gêmeos', emoji: '♊', periodo: '21/05 a 20/06', elemento: 'Ar', regente: 'Mercúrio',
    perfil: 'Geminianos são lembrados pela curiosidade, pela comunicação e pela vontade de experimentar coisas novas — e por mudar de ideia com facilidade.',
    estilo: 'Para quem é de Gêmeos, a sugestão é escolher o jogo e não trocar a cada minuto: anote os números e use o conferidor depois do sorteio. Um bolão com amigos combina com o lado sociável do signo.' },
  { slug: 'cancer', nome: 'Câncer', emoji: '♋', periodo: '21/06 a 22/07', elemento: 'Água', regente: 'Lua',
    perfil: 'Cancerianos são associados à família, à memória afetiva e ao cuidado com quem amam. Datas especiais costumam ter um peso enorme para eles.',
    estilo: 'O canceriano adora jogar datas de aniversário — mas atenção: números até 31 são os mais escolhidos e, se saírem, o prêmio é dividido com mais gente. Que tal misturar uma data querida com números acima de 31?' },
  { slug: 'leao', nome: 'Leão', emoji: '♌', periodo: '23/07 a 22/08', elemento: 'Fogo', regente: 'Sol',
    perfil: 'Leoninos são lembrados pelo brilho, pela generosidade e pelo gosto por estar no centro das atenções. Pensam grande e gostam de celebrar.',
    estilo: 'Para o leonino, a dica é pensar grande sem exagerar no gasto: um bolão permite participar de jogos maiores dividindo o custo. E, se ganhar, discrição — por mais difícil que seja para o signo.' },
  { slug: 'virgem', nome: 'Virgem', emoji: '♍', periodo: '23/08 a 22/09', elemento: 'Terra', regente: 'Mercúrio',
    perfil: 'Virginianos são associados à organização, ao detalhe e à análise. Gostam de entender como as coisas funcionam antes de decidir.',
    estilo: 'O virginiano vai gostar de conhecer a matemática: veja a tabela de preços e chances antes de escolher quantos números marcar. E lembre que nenhuma estatística muda a probabilidade — todas as combinações têm a mesma chance.' },
  { slug: 'libra', nome: 'Libra', emoji: '♎', periodo: '23/09 a 22/10', elemento: 'Ar', regente: 'Vênus',
    perfil: 'Librianos são lembrados pela busca de equilíbrio, harmonia e justiça — e pela dificuldade em tomar decisões.',
    estilo: 'Para o libriano, um jogo "equilibrado" combina com o signo: metade pares, metade ímpares, números baixos e altos misturados. O gerador de números faz isso por você e acaba com a indecisão.' },
  { slug: 'escorpiao', nome: 'Escorpião', emoji: '♏', periodo: '23/10 a 21/11', elemento: 'Água', regente: 'Plutão (tradicionalmente, Marte)',
    perfil: 'Escorpianos são associados à intensidade, à intuição e à determinação. Quando querem algo, vão até o fim.',
    estilo: 'O escorpiano costuma confiar na intuição — e tudo bem escolher números por intuição, desde que o gasto caiba no orçamento. Guarde o comprovante com o mesmo cuidado com que guarda seus segredos.' },
  { slug: 'sagitario', nome: 'Sagitário', emoji: '♐', periodo: '22/11 a 21/12', elemento: 'Fogo', regente: 'Júpiter',
    perfil: 'Sagitarianos são lembrados pelo otimismo, pelo espírito aventureiro e pela fama de "sortudos" do zodíaco — Júpiter, o regente, é tradicionalmente o planeta da expansão.',
    estilo: 'O otimismo sagitariano é ótimo para a festa da virada, mas a chance continua sendo de 1 em 50 milhões com um jogo simples. Aposte pela diversão, com limite definido.' },
  { slug: 'capricornio', nome: 'Capricórnio', emoji: '♑', periodo: '22/12 a 19/01', elemento: 'Terra', regente: 'Saturno',
    perfil: 'Capricornianos são associados à disciplina, à ambição e ao planejamento de longo prazo. Gostam de metas concretas.',
    estilo: 'O capricorniano faz aniversário justamente na época da Virada! A dica para o signo mais planejador: decida o orçamento da aposta e, se ganhar, siga um plano de 90 dias antes de qualquer compra.' },
  { slug: 'aquario', nome: 'Aquário', emoji: '♒', periodo: '20/01 a 18/02', elemento: 'Ar', regente: 'Urano (tradicionalmente, Saturno)',
    perfil: 'Aquarianos são lembrados pela originalidade, pela independência e pelo gosto por ideias diferentes e coletivas.',
    estilo: 'Para o aquariano, fugir do óbvio é natural — e é uma boa ideia na loteria: evitar sequências e datas reduz a chance de dividir o prêmio. Um bolão coletivo também combina com o signo.' },
  { slug: 'peixes', nome: 'Peixes', emoji: '♓', periodo: '19/02 a 20/03', elemento: 'Água', regente: 'Netuno (tradicionalmente, Júpiter)',
    perfil: 'Piscianos são associados à sensibilidade, à imaginação e à empatia. Sonham alto e se emocionam com facilidade.',
    estilo: 'O pisciano adora sonhar com o prêmio — e a simulação "o que comprar com R$ 1 bilhão" foi feita para isso. Na hora de apostar, mantenha os pés no chão: defina o valor antes e não passe dele.' },
];
export const POR_SIGNO = Object.fromEntries(SIGNOS.map((s) => [s.slug, s]));

const sortear = (rnd: () => number, k: number, excluir: Set<number> = new Set()) => {
  const s = new Set<number>(); while (s.size < k) { const d = 1 + Math.floor(rnd() * 60); if (!excluir.has(d)) s.add(d); }
  return [...s].sort((a, b) => a - b);
};
/** Jogo principal, jogo alternativo e dezena da sorte do signo para a Virada do ano. */
export function palpitesSigno(s: Signo) {
  const rnd = hashSeed(`${s.slug}|mega-da-virada|${VIRADA.ano}`);
  const principal = sortear(rnd, 6);
  const alternativo = sortear(rnd, 6, new Set(principal));
  const dezena = principal[Math.floor(rnd() * 6)];
  return { principal, alternativo, dezena };
}
