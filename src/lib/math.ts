import type { Loteria } from './loterias';

const memo = new Map<string, number>();
export function C(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  const key = n + ',' + k;
  const m = memo.get(key);
  if (m !== undefined) return m;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  r = Math.round(r) === r || r < 1e15 ? Math.round(r) : r;
  memo.set(key, r);
  return r;
}

/** Probabilidade hipergeométrica: N no universo, d sorteadas, n marcadas, k acertos. */
export function hyper(N: number, d: number, n: number, k: number) {
  return (C(n, k) * C(N - n, d - k)) / C(N, d);
}

export function universo(l: Loteria) { return l.max - l.min + 1; }

/** Probabilidade de acertar exatamente `k` (e `t` trevos, se +Milionária) marcando n números. */
export function probabilidade(l: Loteria, k: number, n = l.escolhaMin, trevosMarcados = 2, trevosAcerto?: number): number {
  if (l.tipo === 'colunas') {
    // uma escolha por coluna (n = 7). Para apostas com mais números por coluna, p(coluna) = qtd/10
    const p = 0.1;
    return C(7, k) * p ** k * (1 - p) ** (7 - k);
  }
  const pn = hyper(universo(l), l.sorteadas, n, k);
  if (l.tipo === 'trevos') {
    if (trevosAcerto === undefined) return pn;
    if (trevosAcerto === 1) {
      // faixas "x + 1 ou 0 trevo" para 6,5,4 acertos; "x + 1 trevo" para 3 e 2
      const p1 = hyper(6, 2, trevosMarcados, 1);
      const p0 = hyper(6, 2, trevosMarcados, 0);
      return pn * (k >= 4 ? p1 + p0 : p1);
    }
    return pn * hyper(6, 2, trevosMarcados, trevosAcerto);
  }
  return pn;
}

/** "1 em X" */
export function chance(p: number) { return p > 0 ? Math.round(1 / p) : Infinity; }

export function custo(l: Loteria, n = l.escolhaMin, trevos = 2, colunas?: number[]): number {
  if (l.tipo === 'fixo') return l.preco;
  if (l.tipo === 'colunas') return l.preco * (colunas ?? Array(7).fill(1)).reduce((a, b) => a * b, 1);
  if (l.tipo === 'trevos') return l.preco * C(n, 6) * C(trevos, 2);
  return l.preco * C(n, l.escolhaMin);
}

export function apostasEquivalentes(l: Loteria, n = l.escolhaMin, trevos = 2) {
  return Math.round(custo(l, n, trevos) / l.preco);
}
