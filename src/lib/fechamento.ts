// Fechamentos (coberturas) pré-calculados por scripts/gerar-fechamentos.mjs e verificados exaustivamente.
// Formato de cada jogo: máscara de bits (base 36, 5 caracteres) sobre as v dezenas escolhidas, em ordem crescente.
export interface Fechamento {
  v: number; m: number; t: number; n: number; completo: number;
  pCondicao: number;                 // chance de a condição acontecer num sorteio qualquer
  chances: Record<string, number>;   // chance de o melhor jogo fazer pelo menos h acertos (sorteio qualquer)
  jogos: string;
}
export interface Arquivo { loteria: string; k: number; universo: number; sorteadas: number; geradoEm: string; fechamentos: Fechamento[] }

export const LOTERIAS_FECHAMENTO = ['lotofacil', 'mega-sena'] as const;
export const DEZENAS_FECHAMENTO: Record<string, number[]> = {
  lotofacil: [16, 17, 18, 19, 20, 21],
  'mega-sena': [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
};
// prêmios fixos da Lotofácil (11 a 13 acertos)
export const FIXOS_LOTOFACIL: Record<number, number> = { 11: 7, 12: 14, 13: 35 };

export function decodificarJogos(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 5) out.push(parseInt(s.slice(i, i + 5), 36));
  return out;
}
/** Converte uma máscara sobre as dezenas escolhidas (ordenadas) em números do volante. */
export function aplicar(mask: number, dezenas: number[]): number[] {
  const r: number[] = [];
  for (let i = 0; i < dezenas.length; i++) if (mask & (1 << i)) r.push(dezenas[i]);
  return r;
}

const nomeFaixaMega: Record<number, string> = { 4: 'a quadra', 5: 'a quina', 6: 'a sena' };
/** Texto da garantia, ex.: "garante 14 pontos se as 15 sorteadas estiverem entre as suas 18 dezenas". */
export function garantia(loteria: string, f: Pick<Fechamento, 'v' | 'm' | 't'>) {
  if (loteria === 'lotofacil') return `garante ${f.t} pontos se as 15 sorteadas estiverem entre as suas ${f.v} dezenas`;
  const premio = nomeFaixaMega[f.t] ?? `${f.t} acertos`;
  return f.m === 6 ? `garante ${premio} se as 6 sorteadas estiverem entre as suas ${f.v} dezenas` : `garante ${premio} se ${f.m} das 6 sorteadas estiverem entre as suas ${f.v} dezenas`;
}
export function garantiaCurta(loteria: string, f: Pick<Fechamento, 'm' | 't'>) {
  if (loteria === 'lotofacil') return `${f.t} pontos`;
  return `${(nomeFaixaMega[f.t] ?? `${f.t} acertos`).replace(/^a /, '')} com ${f.m} acertos`;
}
/** "1 em 4.006" */
export function umEm(p: number) {
  if (!p) return '—';
  const x = 1 / p;
  return x < 1.05 ? 'praticamente certo' : `1 em ${Math.round(x).toLocaleString('pt-BR')}`;
}
export const pct = (p: number) => `${(p * 100).toLocaleString('pt-BR', { maximumFractionDigits: p < 0.001 ? 4 : p < 0.1 ? 2 : 1 })}%`;
