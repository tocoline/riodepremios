// Frequência das dezenas em janelas recentes (últimos N concursos), para as páginas de ranking.
import type { Loteria } from './loterias';

export interface Freq { dezena: number; vezes: number }

/** Conta as dezenas dos concursos dados (inclui o 2º sorteio da Dupla Sena). Mais frequentes primeiro. */
export function contar(l: Loteria, concursos: { dezenas: number[]; dezenas2?: number[] | null }[]): Freq[] {
  const m = new Map<number, number>();
  for (let d = l.min; d <= l.max; d++) m.set(d, 0);
  for (const c of concursos) for (const lista of [c.dezenas, c.dezenas2]) if (lista) for (const d of lista) if (m.has(d)) m.set(d, m.get(d)! + 1);
  return [...m.entries()].map(([dezena, vezes]) => ({ dezena, vezes })).sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
}

/** Probabilidade de uma dezena específica sair em um concurso. */
export function pSair(l: Loteria) {
  const q = l.sorteadas / (l.max - l.min + 1);
  return l.slug === 'dupla-sena' ? 1 - (1 - q) ** 2 : q;
}
