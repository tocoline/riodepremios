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

const falhas = new WeakSet<object>();
/** true se alguma consulta desta conexão falhou (ex.: limite diário do D1) — páginas devem responder 503, não 404. */
export function dbFalhou(db: DB) { return !db || falhas.has(db as object); }
export function marcarFalha(db: DB) { if (db) falhas.add(db as object); }
async function all(db: DB, q: string, ...binds: any[]): Promise<any[]> {
  if (!db) return [];
  try { const r = await db.prepare(q).bind(...binds).all(); return r.results ?? []; }
  catch (e) { console.error('D1', e); falhas.add(db as object); return []; }
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
  return { itens: rows.map(parse) };
}

// Mega da Virada: concurso especial de fim de ano, desde 31/12/2008 (concurso 1035). Antes disso, 31/12 era concurso comum.
const SO_VIRADA = "AND data >= '2008-12-31' AND (substr(data,6,5)='12-31' OR substr(data,6,2)='01')";
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
/**
 * Anos com concursos. `completo` = o ano não tem buracos (n = último − primeiro + 1) e emenda com
 * o ano anterior e o seguinte (ou começa no concurso 1 / termina no último concurso). Só anos completos
 * entram na navegação e no sitemap; os demais ficam noindex até o coletor completar o histórico.
 */
export async function anos(db: DB, l: Loteria) {
  const lista = (await all(db, "SELECT substr(data,1,4) ano, COUNT(*) n, MIN(numero) primeiro, MAX(numero) ultimo, MAX(atualizado_em) atualizado FROM concursos WHERE loteria=? GROUP BY ano ORDER BY ano DESC", l.api))
    .map((r) => ({ ano: Number(r.ano), n: Number(r.n), primeiro: r.primeiro as number, ultimo: r.ultimo as number, atualizado: r.atualizado as string, completo: false }));
  lista.forEach((a, i) => {
    const seguinte = lista[i - 1], anterior = lista[i + 1];
    const semBuracos = a.n === a.ultimo - a.primeiro + 1;
    const emendaAntes = anterior ? anterior.ultimo === a.primeiro - 1 : a.primeiro === 1;
    const emendaDepois = seguinte ? seguinte.primeiro === a.ultimo + 1 : true;
    a.completo = semBuracos && emendaAntes && emendaDepois;
  });
  return lista;
}
/** Completude de um único ano (consulta leve, usada na página do concurso). */
export async function anoCompleto(db: DB, l: Loteria, ano: number) {
  const r = (await all(db, 'SELECT COUNT(*) n, MIN(numero) primeiro, MAX(numero) ultimo FROM concursos WHERE loteria=? AND data>=? AND data<=?', l.api, `${ano}-01-01`, `${ano}-12-31`))[0];
  if (!r || !r.n) return false;
  if (Number(r.n) !== r.ultimo - r.primeiro + 1) return false;
  const viz = (await all(db, 'SELECT numero, substr(data,1,4) ano FROM concursos WHERE loteria=? AND numero IN (?,?)', l.api, r.primeiro - 1, r.ultimo + 1));
  const antes = r.primeiro === 1 || viz.some((v) => v.numero === r.primeiro - 1);
  const ultimoGeral = Number((await all(db, 'SELECT MAX(numero) m FROM concursos WHERE loteria=?', l.api))[0]?.m ?? 0);
  const depois = r.ultimo === ultimoGeral || viz.some((v) => v.numero === r.ultimo + 1);
  return antes && depois;
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
