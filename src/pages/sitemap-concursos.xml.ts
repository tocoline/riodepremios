import type { APIRoute } from 'astro';
import { getDB, dbFalhou } from '../lib/db';
import { indisponivel } from '../lib/cache';
import { concursos, xml } from '../lib/sitemap';
export const prerender = false;
// Todos os concursos (passados e próximos) e edições do Rio de Prêmios, com <lastmod> real
export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals); const urls = await concursos(db);
  if (dbFalhou(db)) return indisponivel();
  return new Response(xml(urls), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=21600' } });
};
