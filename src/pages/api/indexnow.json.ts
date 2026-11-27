// Situação do IndexNow: último concurso avisado por loteria e último envio (status HTTP e quantidade de URLs).
import type { APIRoute } from 'astro';
import { getDB } from '../../lib/db';
export const prerender = false;
export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals);
  let rows: any[] = [];
  try { rows = ((await db!.prepare('SELECT loteria, numero, em FROM indexnow ORDER BY loteria').all()).results ?? []) as any[]; } catch { /* tabela ainda não criada */ }
  const envio = rows.find((r) => r.loteria === '_envio');
  return Response.json({
    ultimoEnvio: envio ? { status: Math.floor(envio.numero / 100000), urls: envio.numero % 100000, em: envio.em } : null,
    avisados: rows.filter((r) => r.loteria !== '_envio'),
  }, { headers: { 'Cache-Control': 'no-store' } });
};
