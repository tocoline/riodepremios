import { VIRADA } from './loterias';

/** Período em que o resultado da Mega da Virada está saindo/sendo complementado (30 min antes a 36 h depois do sorteio). */
export function janelaVirada(agora = Date.now()) {
  const t = new Date(VIRADA.data).getTime();
  return agora > t - 30 * 60e3 && agora < t + 36 * 3600e3;
}

// Cabeçalhos de cache para páginas dinâmicas (o navegador guarda 1 min; o CDN do Cloudflare, 5 min por padrão).
// Na janela do sorteio da Virada, tudo fica no máximo 1 min no CDN, para o resultado aparecer logo em todas as páginas.
export function cachear(Astro: { response: { headers: Headers } }, cdn = 300) {
  const v = janelaVirada();
  Astro.response.headers.set('Cache-Control', v ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=30' : `public, max-age=60, s-maxage=${cdn}, stale-while-revalidate=600`);
}

/** Responde 404 usando a página estática /404.html. */
export async function naoEncontrado(Astro: { locals: any; url: URL }) {
  const assets = Astro.locals?.runtime?.env?.ASSETS;
  const html = assets ? await (await assets.fetch(new URL('/404.html', Astro.url))).text() : 'Página não encontrada';
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=60' } });
}

/** Banco indisponível (ex.: limite diário): 503 com Retry-After, para o Google tentar de novo em vez de descartar a página. */
export function indisponivel() {
  return new Response('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Volte em instantes</title><p>Estamos atualizando os resultados. Tente novamente em alguns minutos.</p></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '1800', 'Cache-Control': 'no-store' } });
}
