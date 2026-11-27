import type { Loteria } from './loterias';
/** Quantidades de acertos com página "acertei N números", por loteria (inclui as quase premiadas, muito buscadas). */
export function faixaAcertos(l: Loteria): number[] {
  const r = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  return ({ 'mega-sena': r(1, 6), lotofacil: r(8, 15), quina: r(1, 5), 'dupla-sena': r(1, 6), 'dia-de-sorte': r(2, 7), timemania: r(1, 7), 'super-sete': r(1, 7), lotomania: [0, ...r(10, 20)] } as Record<string, number[]>)[l.slug] ?? [];
}
