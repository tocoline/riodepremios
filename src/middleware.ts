import { defineMiddleware } from 'astro:middleware';
import { legado } from './lib/legado';

const GONE = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Conteúdo removido</title><p>Este conteúdo foi removido. <a href="/">Ver os resultados das loterias</a>.</p></html>';

export const onRequest = defineMiddleware(async (ctx, next) => {
  // endereços do site antigo (WordPress): 301 direto para o destino final, ou 410
  const acao = legado(ctx.url.pathname);
  if (acao?.tipo === 'gone') return new Response(GONE, { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
  if (acao?.tipo === 'redirect') return new Response(null, { status: 301, headers: { Location: new URL(acao.para, ctx.url.origin).href, 'Cache-Control': 'public, max-age=86400' } });

  // barra final canônica (1 salto); arquivos, API e endpoints com extensão ficam como estão
  const path = ctx.url.pathname;
  if (!path.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(path) && !path.startsWith('/api/') && !path.startsWith('/_')) {
    return new Response(null, { status: 301, headers: { Location: new URL(path + '/' + ctx.url.search, ctx.url.origin).href } });
  }

  const res = await next();
  // endereços *.pages.dev são cópias técnicas: não devem ser indexados
  if (ctx.url.hostname.endsWith('.pages.dev')) {
    const r = new Response(res.body, res);
    r.headers.set('X-Robots-Tag', 'noindex');
    return r;
  }
  return res;
});
