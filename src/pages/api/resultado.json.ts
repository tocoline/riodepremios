import type { APIRoute } from 'astro';
import { POR_SLUG } from '../../lib/loterias';
import { getDB, ultimos, concurso } from '../../lib/db';

export const prerender = false;

// GET /api/resultado.json?loteria=mega-sena&concurso=ultimo|<número>
export const GET: APIRoute = async ({ url, locals }) => {
  const l = POR_SLUG[url.searchParams.get('loteria') ?? ''];
  if (!l) return Response.json({ erro: 'loteria inválida' }, { status: 404 });
  const ref = url.searchParams.get('concurso') || 'ultimo';
  const db = getDB(locals);
  const c = ref === 'ultimo' ? (await ultimos(db, l, 1))[0] : await concurso(db, l, Number(ref));
  if (!c) return Response.json({ erro: 'concurso não encontrado' }, { status: 404 });
  return Response.json({ ...c, loteria: l.slug, nome: l.nome, fonte: 'Caixa Econômica Federal (API pública de resultados)' }, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300', 'Access-Control-Allow-Origin': '*' },
  });
};
