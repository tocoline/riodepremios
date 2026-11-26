// Rota de último recurso (aceita qualquer caminho, inclusive .php/.png):
// aplica as regras do site antigo; senão, devolve a página 404.
import type { APIRoute } from 'astro';
import { legado } from '../lib/legado';
import { naoEncontrado } from '../lib/cache';

export const prerender = false;
const GONE = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Conteúdo removido</title><p>Este conteúdo foi removido. <a href="/">Ver os resultados das loterias</a>.</p></html>';

export const ALL: APIRoute = async (ctx) => {
  const acao = legado(ctx.url.pathname);
  if (acao?.tipo === 'redirect') return new Response(null, { status: 301, headers: { Location: new URL(acao.para, ctx.url.origin).href } });
  if (acao?.tipo === 'gone') return new Response(GONE, { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  return naoEncontrado(ctx as any);
};
