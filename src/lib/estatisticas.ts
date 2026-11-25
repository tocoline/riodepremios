import type { Loteria } from './loterias';

export interface Stat { dezena: number; vezes: number; atraso: number; ultimo: number | null }

export function calcular(l: Loteria, hist: { numero: number; dezenas: number[]; dezenas2?: number[] | null }[]) {
  const total = hist.length;
  const ultimoNum = hist.at(-1)?.numero ?? 0;
  const mapa = new Map<number, Stat>();
  if (l.tipo !== 'colunas') for (let d = l.min; d <= l.max; d++) mapa.set(d, { dezena: d, vezes: 0, atraso: total, ultimo: null });
  let pares = 0, impares = 0, somaTotal = 0;
  const somas: number[] = [];
  const faixasPI = new Map<string, number>();
  hist.forEach((c, i) => {
    for (const lista of [c.dezenas, c.dezenas2].filter(Boolean) as number[][]) {
      let p = 0, s = 0;
      for (const d of lista) {
        const st = mapa.get(d); if (!st) continue;
        st.vezes++; st.ultimo = c.numero; st.atraso = total - 1 - i;
        if (d % 2 === 0) p++;
        s += d;
      }
      pares += p; impares += lista.length - p; somaTotal += s; somas.push(s);
      const k = `${p}p/${lista.length - p}i`;
      faixasPI.set(k, (faixasPI.get(k) ?? 0) + 1);
    }
  });
  const stats = [...mapa.values()];
  const porVezes = [...stats].sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
  const porAtraso = [...stats].sort((a, b) => b.atraso - a.atraso || a.dezena - b.dezena);
  const maxVezes = porVezes[0]?.vezes || 1;
  return {
    total, ultimoNum, stats, maxVezes,
    mais: porVezes.slice(0, 10), menos: porVezes.slice(-10).reverse(), atrasadas: porAtraso.slice(0, 10),
    pares, impares, somaMedia: somas.length ? Math.round(somaTotal / somas.length) : 0,
    paresImpares: [...faixasPI.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
  };
}
