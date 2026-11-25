import type { APIRoute } from 'astro';
import { POR_API } from '../lib/loterias';
import { getDB } from '../lib/db';
import { SITE } from '../lib/site';
export const prerender = false;
// Sitemap com todas as páginas de concurso (gerado a partir do D1)
export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals);
  let rows: { loteria: string; numero: number; atualizado_em: string }[] = [];
  try { rows = (await db!.prepare('SELECT loteria, numero, atualizado_em FROM concursos ORDER BY loteria, numero DESC LIMIT 45000').all()).results as any; } catch {}
  const urls = rows.filter((r) => POR_API[r.loteria]).map((r) =>
    `<url><loc>${SITE.url}/${POR_API[r.loteria].slug}/concurso/${r.numero}/</loc><lastmod>${r.atualizado_em.slice(0, 10)}</lastmod></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=21600' } });
};
