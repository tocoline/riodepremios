// Palpites estatísticos determinísticos por concurso (mesma entrada → mesmos palpites).
// Importante: nenhuma estratégia aumenta a chance real de ganhar; os palpites são informativos.
import type { Loteria } from './loterias';

function seedRng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function amostra<T>(arr: T[], k: number, rnd: () => number): T[] {
  const a = [...arr];
  for (let i = 0; i < k && i < a.length; i++) { const j = i + Math.floor(rnd() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, k);
}
const ord = (a: number[]) => [...a].sort((x, y) => x - y);

export interface Palpite { nome: string; descricao: string; dezenas: number[]; trevos?: number[] }
export interface Freq { dezena: number; vezes: number; atraso: number }

/** Frequência e atraso nos últimos `janela` concursos. */
export function frequencias(l: Loteria, hist: { dezenas: number[] }[], janela = 100): Freq[] {
  const recorte = hist.slice(-janela);
  const m = new Map<number, Freq>();
  for (let d = l.min; d <= l.max; d++) m.set(d, { dezena: d, vezes: 0, atraso: recorte.length });
  recorte.forEach((c, i) => c.dezenas.forEach((d) => { const f = m.get(d); if (f) { f.vezes++; f.atraso = recorte.length - 1 - i; } }));
  return [...m.values()];
}

export function gerarPalpites(l: Loteria, numero: number, hist: { dezenas: number[]; extra?: any }[]): Palpite[] {
  const rnd = seedRng(`${l.slug}-${numero}`);
  const k = l.escolhaMin;
  const sorteio = () => (l.tipo === 'trevos' ? ord(amostra([1, 2, 3, 4, 5, 6], 2, rnd)) : undefined);

  if (l.tipo === 'colunas') {
    // Super Sete: frequência por coluna
    const cols = Array.from({ length: 7 }, () => new Array(10).fill(0));
    hist.slice(-100).forEach((c) => c.dezenas.forEach((d, i) => { if (i < 7 && d >= 0 && d <= 9) cols[i][d]++; }));
    const quente = cols.map((c) => c.indexOf(Math.max(...c)));
    const frio = cols.map((c) => c.indexOf(Math.min(...c)));
    return [
      { nome: 'Mais frequentes por coluna', descricao: 'O número que mais saiu em cada coluna nos últimos 100 concursos.', dezenas: quente },
      { nome: 'Menos frequentes por coluna', descricao: 'O número que menos saiu em cada coluna — a aposta "contrária".', dezenas: frio },
      { nome: 'Aleatório', descricao: 'Um número sorteado para cada coluna.', dezenas: Array.from({ length: 7 }, () => Math.floor(rnd() * 10)) },
    ];
  }

  const freq = frequencias(l, hist);
  const temDados = hist.length >= 10;
  const quentes = [...freq].sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
  const atrasadas = [...freq].sort((a, b) => b.atraso - a.atraso || a.dezena - b.dezena);
  const todas = freq.map((f) => f.dezena);

  const equilibrado = (): number[] => {
    for (let t = 0; t < 500; t++) {
      const ds = ord(amostra(todas, k, rnd));
      const pares = ds.filter((d) => d % 2 === 0).length;
      const metade = ds.filter((d) => d <= (l.min + l.max) / 2).length;
      let seq = 1, maxSeq = 1;
      for (let i = 1; i < ds.length; i++) { seq = ds[i] === ds[i - 1] + 1 ? seq + 1 : 1; maxSeq = Math.max(maxSeq, seq); }
      if (Math.abs(pares - k / 2) <= 1 && Math.abs(metade - k / 2) <= 1 && maxSeq < 3) return ds;
    }
    return ord(amostra(todas, k, rnd));
  };

  const lista: Palpite[] = [];
  if (temDados) {
    const topo = quentes.slice(0, Math.min(todas.length, Math.max(k + 4, Math.round(k * 1.6)))).map((f) => f.dezena);
    lista.push({ nome: 'Dezenas quentes', descricao: 'Sorteado entre as dezenas que mais saíram nos últimos 100 concursos.', dezenas: ord(amostra(topo, k, rnd)), trevos: sorteio() });
    const atr = atrasadas.slice(0, Math.min(todas.length, Math.max(k + 4, Math.round(k * 1.6)))).map((f) => f.dezena);
    lista.push({ nome: 'Dezenas atrasadas', descricao: 'Sorteado entre as dezenas que estão há mais tempo sem sair.', dezenas: ord(amostra(atr, k, rnd)), trevos: sorteio() });
    const meio = Math.ceil(k / 2);
    const mix = new Set<number>(amostra(quentes.slice(0, k * 2).map((f) => f.dezena), meio, rnd));
    for (const d of amostra(atrasadas.slice(0, k * 2).map((f) => f.dezena), k, rnd)) { if (mix.size >= k) break; mix.add(d); }
    while (mix.size < k) mix.add(todas[Math.floor(rnd() * todas.length)]);
    lista.push({ nome: 'Misto quentes + atrasadas', descricao: 'Metade entre as mais frequentes, metade entre as mais atrasadas.', dezenas: ord([...mix]), trevos: sorteio() });
  }
  lista.push({ nome: 'Equilibrado', descricao: 'Aleatório com pares/ímpares e dezenas baixas/altas equilibrados e sem sequências — evita combinações populares.', dezenas: equilibrado(), trevos: sorteio() });
  return lista;
}
