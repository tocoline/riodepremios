// Histórico compacto de uma loteria (dezenas e prêmios por faixa de todos os concursos),
// usado pela ferramenta "meus números já saíram?". Cache longo no CDN: o banco só é lido em cache miss.
// GET /api/historico.json?loteria=mega-sena
// Formato: n = números dos concursos, d = datas, z = dezenas concatenadas (2 dígitos; 1 no Super Sete, na ordem das colunas),
// z2 = 2º sorteio (Dupla Sena), p/p2 = prêmio por aposta de cada faixa (ordem de `faixas`; 0 = sem ganhador, -1 = faixa inexistente naquele concurso).
import type { APIRoute } from 'astro';
import { POR_SLUG } from '../../lib/loterias';
import { getDB } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const l = POR_SLUG[url.searchParams.get('loteria') ?? ''];
  if (!l || l.tipo === 'trevos') return Response.json({ erro: 'loteria não suportada' }, { status: 404 });
  const db = getDB(locals);
  if (!db) return Response.json({ erro: 'indisponível' }, { status: 503 });
  let rows: any[] = [];
  try { rows = ((await db.prepare('SELECT numero, data, dezenas, dezenas2, premiacoes FROM concursos WHERE loteria=? ORDER BY numero ASC').bind(l.api).all()).results ?? []) as any[]; }
  catch { return Response.json({ erro: 'indisponível' }, { status: 503, headers: { 'Retry-After': '1800' } }); }
  const nf = l.faixas.length;
  const dig = l.tipo === 'colunas' ? 1 : 2;
  const cod = (ds: number[]) => ds.map((x) => String(x).padStart(dig, '0')).join('');
  const dupla = l.slug === 'dupla-sena';
  // valor por aposta de cada faixa: 0 = faixa sem ganhador; -1 = faixa que não existia (ou sem dado) naquele concurso.
  // A faixa é identificada pelo número no texto ("5 acertos") ou, quando o texto não tem número, pela posição.
  const valores = (lista: { descricao?: string; premio: number; ganhadores: number }[]) => l.faixas.map((f, i) => {
    const x = lista.find((r) => Number((/^\s*(\d+)/.exec(r.descricao ?? '') ?? [])[1]) === f.acertos) ?? (/^\s*\d/.test(lista[i]?.descricao ?? '') ? undefined : lista[i]);
    if (!x) return -1;
    return x.ganhadores ? Math.round(x.premio * 100) / 100 : 0;
  });
  const n: number[] = [], d: string[] = [], z: string[] = [], z2: string[] = [], p: number[][] = [], p2: number[][] = [];
  for (const r of rows) {
    let dz: number[];
    try { dz = JSON.parse(r.dezenas); } catch { continue; }
    if (!Array.isArray(dz) || dz.length !== l.sorteadas) continue;
    const pr = (() => { try { return JSON.parse(r.premiacoes || '[]') as any[]; } catch { return []; } })();
    n.push(r.numero); d.push(r.data); z.push(cod(dz));
    if (dupla) {
      let d2: number[] = []; try { d2 = r.dezenas2 ? JSON.parse(r.dezenas2) : []; } catch { /* sem 2º sorteio */ }
      z2.push(d2.length === 6 ? cod(d2) : '');
      // Dupla Sena: faixas 1 a 4 = 1º sorteio, 5 a 8 = 2º (concursos antigos omitem algumas)
      const porFaixa = pr.some((x) => Number(x.faixa) > 0);
      p.push(valores(porFaixa ? pr.filter((x) => Number(x.faixa) <= nf) : pr.slice(0, nf)));
      p2.push(valores(porFaixa ? pr.filter((x) => Number(x.faixa) > nf) : pr.slice(nf, 2 * nf)));
    } else p.push(valores(pr));
  }
  // clientes antigos (páginas ainda em cache, sem ?v=2) não conhecem o -1
  if (url.searchParams.get('v') !== '2') for (const arr of [p, p2]) for (const x of arr) x.forEach((v, i) => { if (v < 0) x[i] = 0; });
  return Response.json({ loteria: l.slug, faixas: l.faixas.map((f) => f.acertos), dig, n, d, z, p, ...(dupla ? { z2, p2 } : {}) }, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400', 'Access-Control-Allow-Origin': '*' },
  });
};
