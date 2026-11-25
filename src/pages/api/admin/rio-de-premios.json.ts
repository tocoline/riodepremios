// Cadastro de resultados do Rio de Prêmios. Protegido pela variável ADMIN_TOKEN (Pages → Settings → Variables).
import type { APIRoute } from 'astro';
import { getDB, rpEdicao, rpSalvar, rpExcluir } from '../../../lib/db';
import type { Sorteio } from '../../../lib/riodepremios';

export const prerender = false;

function autorizado(request: Request, locals: any) {
  const esperado = locals?.runtime?.env?.ADMIN_TOKEN as string | undefined;
  const dado = request.headers.get('x-admin-token') ?? '';
  if (!esperado) return 'ADMIN_TOKEN não configurado no Cloudflare Pages';
  if (dado.length !== esperado.length) return 'senha incorreta';
  let diff = 0; for (let i = 0; i < dado.length; i++) diff |= dado.charCodeAt(i) ^ esperado.charCodeAt(i);
  return diff === 0 ? null : 'senha incorreta';
}
const json = (d: unknown, status = 200) => Response.json(d, { status, headers: { 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ url, locals }) => {
  const e = await rpEdicao(getDB(locals), Number(url.searchParams.get('edicao')));
  return json(e ?? { erro: 'não encontrada' }, e ? 200 : 404);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const erro = autorizado(request, locals);
  if (erro) return json({ erro }, 401);
  let body: any;
  try { body = await request.json(); } catch { return json({ erro: 'JSON inválido' }, 400); }
  const edicao = Number(body.edicao);
  if (!Number.isInteger(edicao) || edicao < 1) return json({ erro: 'edição inválida' }, 400);
  const db = getDB(locals);
  if (body.excluir) { await rpExcluir(db, edicao); return json({ ok: true, excluida: edicao }); }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.data ?? '')) return json({ erro: 'data inválida (use AAAA-MM-DD)' }, 400);
  const sorteios: Sorteio[] = (Array.isArray(body.sorteios) ? body.sorteios : []).slice(0, 100).map((s: any) => ({
    nome: String(s.nome ?? '').slice(0, 120),
    premio: s.premio ? String(s.premio).slice(0, 120) : undefined,
    dezenas: (Array.isArray(s.dezenas) ? s.dezenas : []).map(Number).filter((d: number) => Number.isInteger(d) && d >= 0 && d <= 99).slice(0, 80),
    ganhadores: (Array.isArray(s.ganhadores) ? s.ganhadores : []).map((g: any) => String(g).slice(0, 200)).slice(0, 500),
  }));
  if (!sorteios.length) return json({ erro: 'nenhum sorteio informado' }, 400);
  await rpSalvar(db, { edicao, data: body.data, sorteios, observacoes: body.observacoes ? String(body.observacoes).slice(0, 4000) : null });
  return json({ ok: true, edicao, sorteios: sorteios.length });
};
