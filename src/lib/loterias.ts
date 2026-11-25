// Configuração central de todas as modalidades.
// Preços: valores da aposta mínima vigentes desde o reajuste de julho/2025 — confira sempre no canal oficial.
export type Tipo = 'padrao' | 'colunas' | 'trevos' | 'fixo';

export interface Faixa { acertos: number; label: string; trevos?: number }

export interface Loteria {
  slug: string;           // URL
  api: string;            // nome na API da Caixa
  nome: string;
  curto: string;
  cor: string;            // cor principal
  cor2: string;           // cor do gradiente
  tipo: Tipo;
  min: number; max: number;      // universo de dezenas
  sorteadas: number;
  escolhaMin: number; escolhaMax: number;
  preco: number;
  dias: number[];         // 0=dom ... 6=sáb
  resumo: string;
  extra?: string;         // ex.: "Time do Coração", "Mês da Sorte", "Trevos"
  faixas: Faixa[];
  dicas: string[];
}

export const LOTERIAS: Loteria[] = [
  {
    slug: 'mega-sena', api: 'megasena', nome: 'Mega-Sena', curto: 'Mega',
    cor: '#1fa774', cor2: '#0b6b47', tipo: 'padrao', min: 1, max: 60, sorteadas: 6,
    escolhaMin: 6, escolhaMax: 20, preco: 6, dias: [2, 4, 6],
    resumo: 'A loteria mais famosa do Brasil: escolha de 6 a 20 números entre 1 e 60 e ganhe acertando 4, 5 ou 6 dezenas.',
    faixas: [{ acertos: 6, label: 'Sena (6 acertos)' }, { acertos: 5, label: 'Quina (5 acertos)' }, { acertos: 4, label: 'Quadra (4 acertos)' }],
    dicas: ['Cada dezena a mais multiplica o custo — 7 números custam 7 apostas simples.', 'O concurso especial de 31/12 é a Mega da Virada, que não acumula.'],
  },
  {
    slug: 'lotofacil', api: 'lotofacil', nome: 'Lotofácil', curto: 'Lotofácil',
    cor: '#b4239c', cor2: '#6e0f60', tipo: 'padrao', min: 1, max: 25, sorteadas: 15,
    escolhaMin: 15, escolhaMax: 20, preco: 3.5, dias: [1, 2, 3, 4, 5, 6],
    resumo: 'A loteria com a maior chance de prêmio: marque de 15 a 20 números entre 25 e ganhe a partir de 11 acertos.',
    faixas: [15, 14, 13, 12, 11].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ['As faixas de 11, 12 e 13 acertos têm prêmios fixos.', 'A Lotofácil da Independência é o concurso especial de setembro.'],
  },
  {
    slug: 'quina', api: 'quina', nome: 'Quina', curto: 'Quina',
    cor: '#4b3fd1', cor2: '#22197a', tipo: 'padrao', min: 1, max: 80, sorteadas: 5,
    escolhaMin: 5, escolhaMax: 15, preco: 3, dias: [1, 2, 3, 4, 5, 6],
    resumo: 'Sorteios de segunda a sábado: escolha de 5 a 15 números entre 1 e 80 e ganhe com 2, 3, 4 ou 5 acertos.',
    faixas: [{ acertos: 5, label: 'Quina (5)' }, { acertos: 4, label: 'Quadra (4)' }, { acertos: 3, label: 'Terno (3)' }, { acertos: 2, label: 'Duque (2)' }],
    dicas: ['A Quina de São João é o concurso especial de junho.'],
  },
  {
    slug: 'lotomania', api: 'lotomania', nome: 'Lotomania', curto: 'Lotomania',
    cor: '#f28c1b', cor2: '#a3520a', tipo: 'fixo', min: 0, max: 99, sorteadas: 20,
    escolhaMin: 50, escolhaMax: 50, preco: 3, dias: [1, 3, 5],
    resumo: 'Marque 50 números entre 00 e 99. São sorteadas 20 dezenas e você ganha com 20, 19, 18, 17, 16, 15 ou nenhum acerto.',
    faixas: [20, 19, 18, 17, 16, 15, 0].map((a) => ({ acertos: a, label: a === 0 ? 'Nenhum acerto' : `${a} acertos` })),
    dicas: ['Errar todas as 20 dezenas também dá prêmio.', 'A "aposta espelho" marca os 50 números que você deixou de fora.'],
  },
  {
    slug: 'timemania', api: 'timemania', nome: 'Timemania', curto: 'Timemania',
    cor: '#16a34a', cor2: '#a3a30b', tipo: 'fixo', min: 1, max: 80, sorteadas: 7,
    escolhaMin: 10, escolhaMax: 10, preco: 3.5, dias: [2, 4, 6], extra: 'Time do Coração',
    resumo: 'Escolha 10 números entre 1 e 80 e um Time do Coração. São sorteadas 7 dezenas e um time.',
    faixas: [7, 6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ['Acertar o Time do Coração garante um prêmio fixo.', 'Parte da arrecadação vai para os clubes de futebol participantes.'],
  },
  {
    slug: 'dupla-sena', api: 'duplasena', nome: 'Dupla Sena', curto: 'Dupla',
    cor: '#c0263a', cor2: '#6e0e1b', tipo: 'padrao', min: 1, max: 50, sorteadas: 6,
    escolhaMin: 6, escolhaMax: 15, preco: 3, dias: [1, 3, 5],
    resumo: 'Dois sorteios por concurso com o mesmo bilhete: escolha de 6 a 15 números entre 1 e 50.',
    faixas: [6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ['Você concorre no 1º e no 2º sorteio com a mesma aposta.', 'A Dupla de Páscoa é o concurso especial do ano.'],
  },
  {
    slug: 'dia-de-sorte', api: 'diadesorte', nome: 'Dia de Sorte', curto: 'Dia de Sorte',
    cor: '#d4952c', cor2: '#8a5410', tipo: 'padrao', min: 1, max: 31, sorteadas: 7,
    escolhaMin: 7, escolhaMax: 15, preco: 2.5, dias: [2, 4, 6], extra: 'Mês da Sorte',
    resumo: 'Escolha de 7 a 15 números entre 1 e 31 e um Mês da Sorte. Prêmios para 4 a 7 acertos.',
    faixas: [7, 6, 5, 4].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ['Acertar o Mês da Sorte também paga prêmio fixo.'],
  },
  {
    slug: 'super-sete', api: 'supersete', nome: 'Super Sete', curto: 'Super Sete',
    cor: '#8cc63f', cor2: '#4a7a12', tipo: 'colunas', min: 0, max: 9, sorteadas: 7,
    escolhaMin: 7, escolhaMax: 21, preco: 3, dias: [1, 3, 5],
    resumo: 'Sete colunas com números de 0 a 9: escolha um número por coluna (até 3) e ganhe acertando de 3 a 7 colunas.',
    faixas: [7, 6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} colunas` })),
    dicas: ['O acerto conta por coluna, não pela ordem dos números.'],
  },
  {
    slug: 'mais-milionaria', api: 'maismilionaria', nome: '+Milionária', curto: '+Milionária',
    cor: '#3b3fb8', cor2: '#c9a227', tipo: 'trevos', min: 1, max: 50, sorteadas: 6,
    escolhaMin: 6, escolhaMax: 12, preco: 6, dias: [3, 6], extra: 'Trevos',
    resumo: 'Escolha de 6 a 12 números entre 1 e 50 e de 2 a 6 trevos entre 1 e 6. São 10 faixas de premiação.',
    faixas: [
      { acertos: 6, trevos: 2, label: '6 + 2 trevos' }, { acertos: 6, trevos: 1, label: '6 + 1 ou 0 trevo' },
      { acertos: 5, trevos: 2, label: '5 + 2 trevos' }, { acertos: 5, trevos: 1, label: '5 + 1 ou 0 trevo' },
      { acertos: 4, trevos: 2, label: '4 + 2 trevos' }, { acertos: 4, trevos: 1, label: '4 + 1 ou 0 trevo' },
      { acertos: 3, trevos: 2, label: '3 + 2 trevos' }, { acertos: 3, trevos: 1, label: '3 + 1 trevo' },
      { acertos: 2, trevos: 2, label: '2 + 2 trevos' }, { acertos: 2, trevos: 1, label: '2 + 1 trevo' },
    ],
    dicas: ['O prêmio principal só sai com 6 números e os 2 trevos.', 'É a loteria com o prêmio mínimo garantido mais alto.'],
  },
];

export const POR_SLUG = Object.fromEntries(LOTERIAS.map((l) => [l.slug, l]));
export const POR_API = Object.fromEntries(LOTERIAS.map((l) => [l.api, l]));
export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function diasTexto(l: Loteria) {
  const d = l.dias.map((i) => DIAS[i]);
  return d.length > 1 ? `${d.slice(0, -1).join(', ')} e ${d.at(-1)}` : d[0];
}

// Mega da Virada — sorteio em 31/12, às 20h (horário de Brasília)
export const VIRADA = { ano: 2026, data: '2026-12-31T20:00:00-03:00' };
