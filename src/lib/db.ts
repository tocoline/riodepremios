// Leitura do D1 pelo site. Tudo é tolerante a banco vazio/ausente.
import { POR_API, type Loteria } from './loterias';

export interface Concurso {
  loteria: string; numero: number; data: string;
  dezenas: number[]; dezenas_ordem: number[] | null; dezenas2: number[] | null;
  extra: { time?: string; mes?: string; trevos?: number[] } | null;
  premiacoes: { faixa: number; descricao: string; ganhadores: number; premio: number }[];
  acumulado: boolean; arrecadacao: number | null;
  proximo_numero: number | null; proximo_data: string | null; proximo_estimativa: number | null;
  acumulado_especial: number | null; local: string | null;
  cidades_ganhadoras: { cidade: string; uf: string; ganhadores: number }[] | null;
  especial: boolean; atualizado_em: string;
}

type DB = { prepare: (q: string) => any } | undefined;

export function getDB(locals: any): DB {
  return locals?.runtime?.env?.DB;
}

const J = (s: any) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
function parse(r: any): Concurso {
  return {
    ...r, dezenas: J(r.dezenas) ?? [], dezenas_ordem: J(r.dezenas_ordem), dezenas2: J(r.dezenas2),
    extra: J(r.extra), premiacoes: J(r.premiacoes) ?? [], cidades_ganhadoras: J(r.cidades_ganhadoras),
    acumulado: !!r.acumulado, especial: !!r.especial,
  };
}

async function all(db: DB, q: string, ...binds: any[]): Promise<any[]> {
  if (!db) return [];
  try { const r = await db.prepare(q).bind(...binds).all(); return r.results ?? []; }
  catch (e) { console.error('D1', e); return []; }
}

export async function ultimos(db: DB, l: Loteria, limite = 1): Promise<Concurso[]> {
  return (await all(db, 'SELECT * FROM concursos WHERE loteria=? ORDER BY numero DESC LIMIT ?', l.api, limite)).map(parse);
}

export async function ultimosDeTodas(db: DB): Promise<Record<string, Concurso>> {
  const rows = await all(db, `SELECT c.* FROM concursos c JOIN (SELECT loteria, MAX(numero) m FROM concursos GROUP BY loteria) x
    ON c.loteria=x.loteria AND c.numero=x.m`);
  return Object.fromEntries(rows.map(parse).map((c) => [POR_API[c.loteria]?.slug ?? c.loteria, c]));
}

export async function concurso(db: DB, l: Loteria, numero: number): Promise<Concurso | null> {
  const r = await all(db, 'SELECT * FROM concursos WHERE loteria=? AND numero=?', l.api, numero);
  return r[0] ? parse(r[0]) : null;
}

export async function vizinhos(db: DB, l: Loteria, numero: number) {
  const r = await all(db, `SELECT (SELECT MAX(numero) FROM concursos WHERE loteria=?1 AND numero<?2) ant,
    (SELECT MIN(numero) FROM concursos WHERE loteria=?1 AND numero>?2) prox`, l.api, numero);
  return { anterior: r[0]?.ant ?? null, proximo: r[0]?.prox ?? null };
}

export async function lista(db: DB, l: Loteria, pagina = 1, porPagina = 30) {
  const rows = await all(db, 'SELECT * FROM concursos WHERE loteria=? ORDER BY numero DESC LIMIT ? OFFSET ?', l.api, porPagina, (pagina - 1) * porPagina);
  const tot = await all(db, 'SELECT COUNT(*) n FROM concursos WHERE loteria=?', l.api);
  return { itens: rows.map(parse), total: Number(tot[0]?.n ?? 0) };
}

const SO_VIRADA = "AND (substr(data,6,5)='12-31' OR substr(data,6,2)='01')";
export async function especiais(db: DB, l: Loteria): Promise<Concurso[]> {
  return (await all(db, `SELECT * FROM concursos WHERE loteria=? AND especial=1 ${l.api === 'megasena' ? SO_VIRADA : ''} ORDER BY numero DESC`, l.api)).map(parse);
}

/** Todas as dezenas (leve) para estatísticas. */
export async function historicoDezenas(db: DB, l: Loteria, apenasEspeciais = false) {
  const rows = await all(db, `SELECT numero, data, dezenas, dezenas2 FROM concursos WHERE loteria=? ${apenasEspeciais ? `AND especial=1 ${l.api === 'megasena' ? SO_VIRADA : ''}` : ''} ORDER BY numero ASC`, l.api);
  return rows.map((r) => ({ numero: r.numero as number, data: r.data as string, dezenas: J(r.dezenas) as number[], dezenas2: J(r.dezenas2) as number[] | null }));
}

/** Concursos anteriores a `antesDe` (ordem crescente), para palpites e contexto. */
export async function anteriores(db: DB, l: Loteria, antesDe: number, limite = 100) {
  const rows = await all(db, 'SELECT numero, data, dezenas, acumulado, extra FROM concursos WHERE loteria=? AND numero<? ORDER BY numero DESC LIMIT ?', l.api, antesDe, limite);
  return rows.reverse().map((r) => ({ numero: r.numero as number, data: r.data as string, dezenas: (J(r.dezenas) ?? []) as number[], acumulado: !!r.acumulado, extra: J(r.extra) }));
}

// ---------- arquivo por ano / análise ----------
export async function anos(db: DB, l: Loteria) {
  return (await all(db, "SELECT substr(data,1,4) ano, COUNT(*) n, MIN(numero) primeiro, MAX(numero) ultimo, MAX(atualizado_em) atualizado FROM concursos WHERE loteria=? GROUP BY ano ORDER BY ano DESC", l.api))
    .map((r) => ({ ano: Number(r.ano), n: Number(r.n), primeiro: r.primeiro as number, ultimo: r.ultimo as number, atualizado: r.atualizado as string }));
}
export async function doAno(db: DB, l: Loteria, ano: number): Promise<Concurso[]> {
  return (await all(db, 'SELECT * FROM concursos WHERE loteria=? AND data>=? AND data<=? ORDER BY numero DESC', l.api, `${ano}-01-01`, `${ano}-12-31`)).map(parse);
}
export async function doMes(db: DB, l: Loteria, anoMes: string) {
  return (await all(db, 'SELECT numero, data, acumulado FROM concursos WHERE loteria=? AND substr(data,1,7)=? ORDER BY numero', l.api, anoMes))
    .map((r) => ({ numero: r.numero as number, data: r.data as string, acumulado: !!r.acumulado }));
}
/** Último concurso anterior a `n` em que cada dezena saiu. */
export async function ultimaAparicao(db: DB, l: Loteria, n: number, dezenas: number[]) {
  if (!dezenas.length) return {} as Record<number, number>;
  const rows = await all(db, `SELECT CAST(j.value AS INTEGER) d, MAX(c.numero) ult FROM concursos c, json_each(c.dezenas) j
    WHERE c.loteria=? AND c.numero<? AND CAST(j.value AS INTEGER) IN (${dezenas.map(() => '?').join(',')}) GROUP BY d`, l.api, n, ...dezenas);
  return Object.fromEntries(rows.map((r) => [Number(r.d), Number(r.ult)])) as Record<number, number>;
}
export async function menorNumero(db: DB, l: Loteria) {
  const r = await all(db, 'SELECT MIN(numero) m FROM concursos WHERE loteria=?', l.api);
  return Number(r[0]?.m ?? 0);
}
/** Frequência das dezenas por ano (para estatísticas). */
export async function frequenciaPorAno(db: DB, l: Loteria) {
  return (await all(db, `SELECT substr(c.data,1,4) ano, CAST(j.value AS INTEGER) d, COUNT(*) n FROM concursos c, json_each(c.dezenas) j
    WHERE c.loteria=? GROUP BY ano, d`, l.api)).map((r) => ({ ano: Number(r.ano), d: Number(r.d), n: Number(r.n) }));
}
