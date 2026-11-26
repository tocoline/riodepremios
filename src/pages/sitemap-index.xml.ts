import type { APIRoute } from 'astro';
import { getDB } from '../lib/db';
import { paginas, concursos, semFuturo } from '../lib/sitemap';
import { SITE } from '../lib/site';
export const prerender = false;
export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals);
  const [p, c] = await Promise.all([paginas(db), concursos(db)]);
  const maior = (u: { lastmod: string }[]) => u.map((x) => semFuturo(x.lastmod)).sort().at(-1);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<sitemap><loc>${SITE.url}/sitemap-0.xml</loc><lastmod>${maior(p)}</lastmod></sitemap>\n<sitemap><loc>${SITE.url}/sitemap-concursos.xml</loc><lastmod>${maior(c)}</lastmod></sitemap>\n</sitemapindex>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900, s-maxage=1800' } });
};
