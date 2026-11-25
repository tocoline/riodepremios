// Utilitários para os scripts de cliente das ferramentas
export const $ = <T extends Element = HTMLElement>(root: ParentNode, s: string) => root.querySelector(s) as T;
export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const int = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString('pt-BR') : '∞');
export const p2 = (n: number, d = 2) => String(n).padStart(d, '0');
export const bolas = (ds: number[], cor: string, hits: number[] = [], dig = 2, cls = '') =>
  `<div class="balls">${ds.map((d) => `<span class="ball ${cls} ${hits.includes(d) ? 'hit' : ''}" style="--c:${cor}">${p2(d, dig)}</span>`).join('')}</div>`;
export function sortear(min: number, max: number, k: number, rnd = Math.random): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = 0; i < k; i++) { const j = i + Math.floor(rnd() * (pool.length - i)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, k).sort((a, b) => a - b);
}
export function cryptoRnd() { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 2 ** 32; }
