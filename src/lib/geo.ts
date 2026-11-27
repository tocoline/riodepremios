// Ganhadores por cidade em todas as loterias (tabela cidades_agg), recalculada no máximo a cada 6h.
// Cada página de cidade lê 1 linha; o recálculo roda em segundo plano (waitUntil) quando os dados envelhecem.
import { LOTERIAS, POR_API } from './loterias';
import { marcarFalha } from './db';

export const MIN_PREMIOS = 3; // cidades com menos prêmios não ganham página própria
const IDADE = 6 * 3600e3;
const TABELAS = [
  'CREATE TABLE IF NOT EXISTS cidades_agg (uf TEXT NOT NULL, slug TEXT NOT NULL, nome TEXT NOT NULL, total INTEGER NOT NULL, dados TEXT NOT NULL, PRIMARY KEY (uf, slug))',
  'CREATE INDEX IF NOT EXISTS idx_cidades_uf ON cidades_agg (uf, total DESC)',
  'CREATE TABLE IF NOT EXISTS geo_meta (chave TEXT PRIMARY KEY, valor TEXT)',
];

export const slugCidade = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface CidadeDados {
  nome: string; uf: string; total: number;
  porLoteria: Record<string, { n: number; ultimos: [number, string, number][] }>; // api → [numero, data, prêmio]
  primeiro: string; ultimo: string;
}

async function tabelas(db: any) { for (const t of TABELAS) await db.prepare(t).run(); }

/** Recalcula a agregação a partir de todos os concursos com cidade informada. */
async function recalcular(db: any) {
  const { results } = await db.prepare("SELECT loteria, numero, data, cidades_ganhadoras, premiacoes FROM concursos WHERE cidades_ganhadoras IS NOT NULL ORDER BY numero DESC").all();
  const m = new Map<string, CidadeDados>();
  for (const r of results as any[]) {
    if (!POR_API[r.loteria]) continue;
    const premio = (JSON.parse(r.premiacoes || '[]')[0]?.premio ?? 0) as number;
    for (const g of JSON.parse(r.cidades_ganhadoras)) {
      const uf = String(g.uf || '').toUpperCase().trim(); const nome = String(g.cidade || '').trim();
      if (!nome || !/^[A-Z]{2}$/.test(uf) || uf === 'BR' || /canal|eletr|internet/i.test(nome)) continue;
      const k = uf + '|' + slugCidade(nome);
      const c = m.get(k) ?? { nome, uf, total: 0, porLoteria: {}, primeiro: r.data, ultimo: r.data };
      const n = Number(g.ganhadores) || 1;
      c.total += n;
      const pl = c.porLoteria[r.loteria] ?? (c.porLoteria[r.loteria] = { n: 0, ultimos: [] });
      pl.n += n; if (pl.ultimos.length < 10) pl.ultimos.push([r.numero, r.data, premio]);
      if (r.data < c.primeiro) c.primeiro = r.data; if (r.data > c.ultimo) c.ultimo = r.data;
      m.set(k, c);
    }
  }
  await tabelas(db);
  const st = db.prepare('INSERT INTO cidades_agg (uf, slug, nome, total, dados) VALUES (?1,?2,?3,?4,?5) ON CONFLICT(uf, slug) DO UPDATE SET nome=excluded.nome, total=excluded.total, dados=excluded.dados');
  const linhas = [...m.values()];
  for (let i = 0; i < linhas.length; i += 200) await db.batch(linhas.slice(i, i + 200).map((c) => st.bind(c.uf, slugCidade(c.nome), c.nome, c.total, JSON.stringify(c))));
  await db.prepare("INSERT INTO geo_meta (chave, valor) VALUES ('calculado_em', ?1) ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor").bind(new Date().toISOString()).run();
}

/** Garante dados: se não houver, calcula agora; se estiverem velhos, recalcula em segundo plano. */
export async function garantirGeo(db: any, ctx?: { waitUntil: (p: Promise<unknown>) => void }) {
  if (!db) return false;
  try {
    const meta = await db.prepare("SELECT valor FROM geo_meta WHERE chave='calculado_em'").first().catch(() => null);
    if (!meta) { await recalcular(db); return true; }
    if (Date.now() - Date.parse(meta.valor) > IDADE) {
      // marca antes para evitar recálculos simultâneos; recalcula em segundo plano
      await db.prepare("UPDATE geo_meta SET valor=?1 WHERE chave='calculado_em'").bind(new Date().toISOString()).run();
      const p = recalcular(db).catch((e) => console.error('geo', String(e)));
      if (ctx?.waitUntil) ctx.waitUntil(p); else await p;
    }
    return true;
  } catch (e) { console.error('geo', String(e)); marcarFalha(db); return false; }
}

export async function cidade(db: any, uf: string, slug: string): Promise<CidadeDados | null> {
  try { const r = await db.prepare('SELECT dados FROM cidades_agg WHERE uf=? AND slug=?').bind(uf, slug).first(); return r ? JSON.parse(r.dados) : null; }
  catch { marcarFalha(db); return null; }
}
export async function cidadesDaUF(db: any, uf: string) {
  try { return ((await db.prepare('SELECT slug, nome, total FROM cidades_agg WHERE uf=? ORDER BY total DESC, nome').bind(uf).all()).results ?? []) as { slug: string; nome: string; total: number }[]; }
  catch { marcarFalha(db); return []; }
}
export async function topCidades(db: any, limite = 50) {
  try { return ((await db.prepare('SELECT uf, slug, nome, total FROM cidades_agg ORDER BY total DESC LIMIT ?').bind(limite).all()).results ?? []) as { uf: string; slug: string; nome: string; total: number }[]; }
  catch { marcarFalha(db); return []; }
}
export async function cidadesComPagina(db: any) {
  try { return ((await db.prepare('SELECT uf, slug FROM cidades_agg WHERE total >= ?').bind(MIN_PREMIOS).all()).results ?? []) as { uf: string; slug: string }[]; }
  catch { return []; }
}
export const NOMES_LOT = Object.fromEntries(LOTERIAS.map((l) => [l.api, l]));
