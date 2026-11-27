// Resumo pré-calculado de cada loteria (estatísticas, anos, totais), gravado na tabela `resumo`.
// Evita ler o histórico inteiro a cada visita: o resumo só é recalculado quando entra um concurso novo
// (mudou o último número) ou a cada 6 horas (enquanto o coletor completa o histórico).
import type { Loteria } from './loterias';
import { calcular } from './estatisticas';
import { marcarFalha } from './db';

export interface AnoInfo { ano: number; n: number; primeiro: number; ultimo: number; atualizado: string; ult: string; completo: boolean }
export interface DezenaInfo { companheiras: [number, number][]; recentes: [number, string][] }
export interface FaixaInfo { descricao: string; concursos: number; comGanhador: number; media: number; minimo: number; maximo: number; maxNumero: number | null; ultimoValor: number | null }
export interface Resumo {
  versao: number;
  total: number; primeiro: number; ultimo: number; atualizado: string; calculadoEm: string;
  s: ReturnType<typeof calcular>;
  porAno: { ano: number; d: number; n: number }[];
  anos: AnoInfo[];
  dezenas: Record<number, DezenaInfo>;     // companheiras mais frequentes e últimos concursos de cada dezena
  faixas: FaixaInfo[];                     // prêmios por faixa nos últimos concursos
  faixasJanela: { de: number; ate: number; acumulou: number };
}
const VERSAO = 2; // aumente para forçar o recálculo quando o formato mudar

const IDADE_MAX = 6 * 3600e3;
const TABELA = 'CREATE TABLE IF NOT EXISTS resumo (loteria TEXT PRIMARY KEY, ultimo INTEGER, calculado_em TEXT, dados TEXT)';

// cache em memória por isolate (evita até a leitura da linha do resumo em visitas seguidas)
const memoria = new Map<string, { r: Resumo; em: number }>();

function anosDe(rows: { numero: number; data: string; atualizado_em: string }[]): AnoInfo[] {
  const m = new Map<number, AnoInfo>();
  for (const r of rows) {
    const ano = Number(r.data.slice(0, 4));
    const a = m.get(ano) ?? { ano, n: 0, primeiro: Infinity, ultimo: 0, atualizado: '', ult: '', completo: false };
    a.n++; a.primeiro = Math.min(a.primeiro, r.numero); a.ultimo = Math.max(a.ultimo, r.numero);
    if (r.atualizado_em > a.atualizado) a.atualizado = r.atualizado_em;
    if (r.data > a.ult) a.ult = r.data;
    m.set(ano, a);
  }
  const lista = [...m.values()].sort((x, y) => y.ano - x.ano);
  lista.forEach((a, i) => {
    const seguinte = lista[i - 1], anterior = lista[i + 1];
    a.completo = a.n === a.ultimo - a.primeiro + 1 && (anterior ? anterior.ultimo === a.primeiro - 1 : a.primeiro === 1) && (seguinte ? seguinte.primeiro === a.ultimo + 1 : true);
  });
  return lista;
}

async function calcularResumo(db: any, l: Loteria): Promise<Resumo | null> {
  const { results } = await db.prepare('SELECT numero, data, dezenas, dezenas2, atualizado_em FROM concursos WHERE loteria=? ORDER BY numero ASC').bind(l.api).all();
  if (!results?.length) return null;
  const hist = results.map((r: any) => ({ numero: r.numero, data: r.data, atualizado_em: r.atualizado_em, dezenas: JSON.parse(r.dezenas) as number[], dezenas2: r.dezenas2 ? JSON.parse(r.dezenas2) as number[] : null }));
  const porAnoMap = new Map<string, number>();
  if (l.tipo !== 'colunas') for (const c of hist) for (const d of c.dezenas) { const k = c.data.slice(0, 4) + ':' + d; porAnoMap.set(k, (porAnoMap.get(k) ?? 0) + 1); }
  // dezenas companheiras e últimas aparições
  const dezenas: Record<number, DezenaInfo> = {};
  if (l.tipo !== 'colunas') {
    const pares = new Map<number, Map<number, number>>();
    const recentes = new Map<number, [number, string][]>();
    for (let i = hist.length - 1; i >= 0; i--) {
      const c = hist[i];
      for (const d of c.dezenas) {
        const r = recentes.get(d) ?? []; if (r.length < 12) { r.push([c.numero, c.data]); recentes.set(d, r); }
        const m = pares.get(d) ?? new Map<number, number>();
        for (const e of c.dezenas) if (e !== d) m.set(e, (m.get(e) ?? 0) + 1);
        pares.set(d, m);
      }
    }
    for (let d = l.min; d <= l.max; d++) {
      const comp = [...(pares.get(d)?.entries() ?? [])].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 8) as [number, number][];
      dezenas[d] = { companheiras: comp, recentes: recentes.get(d) ?? [] };
    }
  }
  // prêmios por faixa nos últimos 150 concursos
  const { results: rat } = await db.prepare('SELECT numero, premiacoes, acumulado FROM concursos WHERE loteria=? ORDER BY numero DESC LIMIT 150').bind(l.api).all();
  const fx = new Map<string, FaixaInfo & { soma: number }>();
  let acumulou = 0;
  for (const r of rat as any[]) {
    if (r.acumulado) acumulou++;
    for (const p of JSON.parse(r.premiacoes || '[]')) {
      const k = String(p.descricao || p.faixa);
      const f = fx.get(k) ?? { descricao: k, concursos: 0, comGanhador: 0, media: 0, minimo: Infinity, maximo: 0, maxNumero: null, ultimoValor: null, soma: 0 };
      f.concursos++;
      if (p.ganhadores > 0 && p.premio > 0) {
        f.comGanhador++; f.soma += p.premio; f.minimo = Math.min(f.minimo, p.premio);
        if (p.premio > f.maximo) { f.maximo = p.premio; f.maxNumero = r.numero; }
        if (f.ultimoValor === null) f.ultimoValor = p.premio;
      }
      fx.set(k, f);
    }
  }
  const faixas = [...fx.values()].map(({ soma, ...f }) => ({ ...f, media: f.comGanhador ? soma / f.comGanhador : 0, minimo: Number.isFinite(f.minimo) ? f.minimo : 0 }));
  const nums = (rat as any[]).map((r) => r.numero);

  return {
    versao: VERSAO, dezenas, faixas, faixasJanela: { de: nums.length ? Math.min(...nums) : 0, ate: nums.length ? Math.max(...nums) : 0, acumulou },
    total: hist.length, primeiro: hist[0].numero, ultimo: hist.at(-1)!.numero,
    atualizado: hist.reduce((m: string, c: any) => (c.atualizado_em > m ? c.atualizado_em : m), ''), calculadoEm: new Date().toISOString(),
    s: calcular(l, hist),
    porAno: [...porAnoMap.entries()].map(([k, n]) => { const [ano, d] = k.split(':').map(Number); return { ano, d, n }; }),
    anos: anosDe(hist),
  };
}

/** Resumo da loteria (lê 1 linha; recalcula só se entrou concurso novo ou passou de 6h). */
export async function resumo(db: any, l: Loteria): Promise<Resumo | null> {
  if (!db) return null;
  const mem = memoria.get(l.api);
  if (mem && Date.now() - mem.em < 5 * 60e3) return mem.r;
  try {
    const [topo, salvo] = await Promise.all([
      db.prepare('SELECT MAX(numero) m FROM concursos WHERE loteria=?').bind(l.api).first(),
      db.prepare('SELECT ultimo, calculado_em, dados FROM resumo WHERE loteria=?').bind(l.api).first().catch(async () => { await db.prepare(TABELA).run(); return null; }),
    ]);
    const atual = Number(topo?.m ?? 0);
    const salvoR = salvo ? (JSON.parse(salvo.dados) as Resumo) : null;
    if (salvo && salvoR?.versao === VERSAO && salvo.ultimo === atual && Date.now() - Date.parse(salvo.calculado_em) < IDADE_MAX) {
      const r = salvoR; memoria.set(l.api, { r, em: Date.now() }); return r;
    }
    const r = await calcularResumo(db, l);
    if (r) {
      await db.prepare(TABELA).run();
      await db.prepare('INSERT INTO resumo (loteria, ultimo, calculado_em, dados) VALUES (?1,?2,?3,?4) ON CONFLICT(loteria) DO UPDATE SET ultimo=excluded.ultimo, calculado_em=excluded.calculado_em, dados=excluded.dados')
        .bind(l.api, r.ultimo, r.calculadoEm, JSON.stringify(r)).run();
      memoria.set(l.api, { r, em: Date.now() });
    }
    return r;
  } catch (e) { console.error('resumo', String(e)); marcarFalha(db); return null; }
}
