import { defineMiddleware } from 'astro:middleware';
import { REMOVIDOS } from './lib/legado';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const p = ctx.url.pathname.endsWith('/') ? ctx.url.pathname : ctx.url.pathname + '/';
  if (REMOVIDOS.includes(p)) {
    return new Response('<!doctype html><meta charset="utf-8"><title>Conteúdo removido</title><p>Este conteúdo foi removido. <a href="/">Ver resultados das loterias</a>.</p>', { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return next();
});
