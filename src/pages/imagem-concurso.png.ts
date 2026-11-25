// Imagem 1200×675 de cada concurso (Google Discover/Notícias, WhatsApp, redes sociais).
// Uso: /imagem-concurso.png?l=mega-sena&n=3091
import type { APIRoute } from 'astro';
import { ImageResponse, CustomFont, cache } from '@cf-wasm/og/workerd';
import { POR_SLUG, DIAS } from '../lib/loterias';
import { getDB, concurso, ultimos } from '../lib/db';
import { reaisCurto, pad } from '../lib/format';

export const prerender = false;

type N = { type: string; props: Record<string, any> };
const h = (type: string, style: Record<string, any>, ...children: any[]): N => ({ type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } });

export const GET: APIRoute = async ({ url, locals }) => {
  const env = (locals as any).runtime?.env;
  const ctx = (locals as any).runtime?.ctx;
  if (ctx) cache.setExecutionContext(ctx);
  const l = POR_SLUG[url.searchParams.get('l') ?? ''];
  const n = Number(url.searchParams.get('n'));
  if (!l || !Number.isInteger(n) || n < 1) return new Response('parâmetros inválidos', { status: 400 });

  const db = getDB(locals);
  const c = await concurso(db, l, n);
  const [ult] = c ? [null] : await ultimos(db, l, 1);
  const prox = !c && ult && ult.proximo_numero === n ? ult : null;
  if (!c && !prox) return new Response('concurso não encontrado', { status: 404 });

  const dataIso = c ? c.data : prox!.proximo_data;
  const dia = dataIso ? (() => { const [y, m, d] = dataIso.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d, 12)); return `${DIAS[dt.getUTCDay()]}, ${pad(d)}/${pad(m)}/${y}`; })() : '';
  const dig = l.tipo === 'colunas' ? 1 : 2;
  const fonte = (f: string) => () => env.ASSETS.fetch(new URL(`/og-fonts/${f}`, url)).then((r: Response) => r.arrayBuffer());

  const bola = (d: number, cor: string, s: number) => h('div', {
    width: s, height: s, borderRadius: s, alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: s * 0.42,
    fontFamily: 'SG', backgroundImage: `radial-gradient(circle at 32% 28%, #ffffff66 0%, ${cor} 45%, #00000066 100%)`, backgroundColor: cor,
  }, pad(d, dig));

  let corpo: N;
  if (c) {
    const s = c.dezenas.length > 10 ? 76 : c.dezenas.length > 7 ? 84 : 104;
    const linhas: number[][] = [];
    for (let i = 0; i < c.dezenas.length; i += c.dezenas.length > 10 ? 8 : 10) linhas.push(c.dezenas.slice(i, i + (c.dezenas.length > 10 ? 8 : 10)));
    corpo = h('div', { flexDirection: 'column', gap: 18 },
      h('div', { fontSize: 30, color: '#9aa6bf', fontFamily: 'IN6' }, 'Resultado'),
      ...linhas.map((ln) => h('div', { gap: 16 }, ...ln.map((d) => bola(d, l.cor, s)))),
      h('div', { fontSize: 34, color: c.acumulado ? '#ffd979' : '#2fdc98', fontFamily: 'SG', marginTop: 8 }, c.acumulado ? 'Acumulou!' : 'Teve ganhador!'),
    );
  } else {
    corpo = h('div', { flexDirection: 'column', gap: 10 },
      h('div', { fontSize: 30, color: '#9aa6bf', fontFamily: 'IN6' }, prox!.proximo_estimativa ? 'Prêmio estimado' : 'Sorteio às 20h'),
      h('div', { fontSize: 104, color: '#ffd979', fontFamily: 'SG', letterSpacing: -3 }, prox!.proximo_estimativa ? reaisCurto(prox!.proximo_estimativa) : 'Hoje, 20h'),
      h('div', { fontSize: 32, color: '#eef2fb', fontFamily: 'IN6', marginTop: 10 }, 'Palpites, estatísticas e resultado ao vivo'),
    );
  }

  const arvore = h('div', {
    width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', color: '#fff', fontFamily: 'IN4',
    backgroundColor: '#070b18', backgroundImage: `radial-gradient(60% 90% at 100% 0%, ${l.cor}88, transparent 60%), radial-gradient(50% 80% at 0% 100%, ${l.cor2}66, transparent 60%)`,
  },
    h('div', { justifyContent: 'space-between', alignItems: 'center' },
      h('div', { fontSize: 34, fontFamily: 'SG', gap: 10 }, h('span', {}, 'Rio de'), h('span', { color: '#ffd979' }, 'Prêmios')),
      h('div', { fontSize: 26, color: '#c8d0e0', padding: '10px 22px', borderRadius: 40, border: '2px solid #ffffff33' }, c ? 'Resultado oficial' : 'Próximo sorteio'),
    ),
    h('div', { flexDirection: 'column', gap: 6 },
      h('div', { fontSize: 76, fontFamily: 'SG', letterSpacing: -2 }, `${l.nome} ${n}`),
      h('div', { fontSize: 34, color: '#c8d0e0' }, dia + (c ? '' : ' · 20h (Brasília)')),
    ),
    corpo,
  );

  const img = await ImageResponse.async(arvore as any, {
    width: 1200, height: 675, format: 'png',
    fonts: [new CustomFont('SG', fonte('sg700.woff'), { weight: 700 }), new CustomFont('IN4', fonte('in400.woff'), { weight: 400 }), new CustomFont('IN6', fonte('in600.woff'), { weight: 600 })],
  });
  const h2 = new Headers(img.headers);
  h2.set('Cache-Control', c ? 'public, max-age=86400, s-maxage=604800' : 'public, max-age=600, s-maxage=1800');
  return new Response(img.body, { status: 200, headers: h2 });
};
