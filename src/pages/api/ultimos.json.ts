import type { APIRoute } from 'astro';
import { getDB, ultimosDeTodas } from '../../lib/db';
export const prerender = false;
export const GET: APIRoute = async ({ locals }) =>
  Response.json(await ultimosDeTodas(getDB(locals)), { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300', 'Access-Control-Allow-Origin': '*' } });
