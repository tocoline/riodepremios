// Cabeçalhos de cache para páginas dinâmicas (o navegador guarda 1 min; o CDN do Cloudflare, 5 min).
export function cachear(Astro: { response: { headers: Headers } }, cdn = 300) {
  Astro.response.headers.set('Cache-Control', `public, max-age=60, s-maxage=${cdn}, stale-while-revalidate=600`);
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
