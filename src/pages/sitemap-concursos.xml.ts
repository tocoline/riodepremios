import type { APIRoute } from 'astro';
import { getDB } from '../lib/db';
import { concursos, xml } from '../lib/sitemap';
export const prerender = false;
// Todos os concursos (passados e próximos) e edições do Rio de Prêmios, com <lastmod> real
export const GET: APIRoute = async ({ locals }) =>
  new Response(xml(await concursos(getDB(locals))), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=10800' } });
