import type { APIRoute } from 'astro';
import { POR_API } from '../lib/loterias';
import { getDB } from '../lib/db';
import { edicoesPublicadas } from '../lib/riodepremios';
import { VIRADA } from '../lib/loterias';
import { SITE } from '../lib/site';
export const prerender = false;
// Sitemap com todas as páginas de concurso (gerado a partir do D1)
export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals);
  let rows: { loteria: string; numero: number; atualizado_em: string }[] = [];
  try { rows = (await db!.prepare('SELECT loteria, numero, atualizado_em FROM concursos ORDER BY loteria, numero DESC LIMIT 45000').all()).results as any; } catch {}
  // próximos concursos (páginas pré-sorteio)
  let prox: { loteria: string; proximo_numero: number }[] = [];
  try { prox = (await db!.prepare('SELECT c.loteria, c.proximo_numero FROM concursos c JOIN (SELECT loteria, MAX(numero) m FROM concursos GROUP BY loteria) x ON c.loteria=x.loteria AND c.numero=x.m WHERE c.proximo_numero IS NOT NULL').all()).results as any; } catch {}
  const hoje = new Date().toISOString().slice(0, 10);
  const urlsProx = prox.filter((r) => POR_API[r.loteria]).map((r) =>
    `<url><loc>${SITE.url}/${POR_API[r.loteria].slug}/concurso/${r.proximo_numero}/</loc><lastmod>${hoje}</lastmod></url>`).join('');
  const rp = edicoesPublicadas().reverse().map((n) => `<url><loc>${SITE.url}/rio-de-premios/edicao/${n}/</loc><lastmod>${hoje}</lastmod></url>`).join('');
  const virada = rows.some((r) => r.loteria === 'megasena' && r.numero === VIRADA.concurso) || prox.some((r) => r.loteria === 'megasena' && r.proximo_numero === VIRADA.concurso)
    ? '' : `<url><loc>${SITE.url}/mega-sena/concurso/${VIRADA.concurso}/</loc><lastmod>${hoje}</lastmod></url>`;
  const urls = virada + rp + urlsProx + rows.filter((r) => POR_API[r.loteria]).map((r) =>
    `<url><loc>${SITE.url}/${POR_API[r.loteria].slug}/concurso/${r.numero}/</loc><lastmod>${r.atualizado_em.slice(0, 10)}</lastmod></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=21600' } });
};
