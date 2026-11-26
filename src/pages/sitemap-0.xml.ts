import type { APIRoute } from 'astro';
import { getDB } from '../lib/db';
import { paginas, xml } from '../lib/sitemap';
export const prerender = false;
export const GET: APIRoute = async ({ locals }) =>
  new Response(xml(await paginas(getDB(locals))), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900, s-maxage=1800' } });
