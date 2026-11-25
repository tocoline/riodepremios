// Imagem 1200×675 de cada concurso (Google Discover/Notícias, WhatsApp, redes sociais).
// Uso: /imagem-concurso.png?l=mega-sena&n=3091
import type { APIRoute } from 'astro';
import { ImageResponse, CustomFont, cache } from '@cf-wasm/og/workerd';
import { POR_SLUG, DIAS, VIRADA } from '../lib/loterias';
import { getDB, concurso, ultimos } from '../lib/db';
import { RP, dataEdicao, proximaEdicao, isoSorteio } from '../lib/riodepremios';
import { reaisCurto, pad } from '../lib/format';

export const prerender = false;

type N = { type: string; props: Record<string, any> };
const h = (type: string, style: Record<string, any>, ...children: any[]): N => ({ type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } });

export const GET: APIRoute = async ({ url, locals }) => {
  const env = (locals as any).runtime?.env;
  const ctx = (locals as any).runtime?.ctx;
  if (ctx) cache.setExecutionContext(ctx);
  const tipo = url.searchParams.get('tipo');
  if (tipo === 'jogo' || tipo === 'bolao' || tipo === 'rende') {
    // ---- Imagens de compartilhamento da Mega da Virada ----
    const fonteV = (f: string) => () => env.ASSETS.fetch(new URL(`/og-fonts/${f}`, url)).then((r: Response) => r.arrayBuffer());
    const dz = (url.searchParams.get('d') ?? '').split('-').map(Number).filter((x) => Number.isInteger(x) && x >= 1 && x <= 60).slice(0, 15);
    const nome = (url.searchParams.get('n') ?? '').replace(/[^\p{L} ]/gu, '').trim().slice(0, 24);
    const titulo = tipo === 'jogo' ? (nome ? `Os números da sorte de ${nome}` : 'Meus números da sorte')
      : tipo === 'bolao' ? (nome ? `Bolão: ${nome}` : 'Nosso bolão da Mega da Virada')
      : 'Quanto rende R$ 1 bilhão?';
    const s = dz.length > 8 ? 78 : 100;
    const bolaV = (d: number) => h('div', { width: s, height: s, borderRadius: s, alignItems: 'center', justifyContent: 'center', color: '#2b1d00', fontSize: s * 0.42, fontFamily: 'SG', backgroundColor: '#d9a521', backgroundImage: 'radial-gradient(circle at 32% 28%, #fff3c4 0%, #e9b730 45%, #7a5605 100%)' }, String(d).padStart(2, '0'));
    const corpoV = tipo === 'rende'
      ? h('div', { flexDirection: 'column', gap: 6 }, h('div', { fontSize: 34, color: '#c8d0e0' }, 'Aplicado, depois do Imposto de Renda:'), h('div', { fontSize: 88, color: '#ffd979', fontFamily: 'SG', letterSpacing: -3 }, url.searchParams.get('v')?.slice(0, 24) ?? 'por dia, hora e segundo'))
      : h('div', { gap: 16, flexWrap: 'wrap', maxWidth: 1080 }, ...dz.map(bolaV));
    const arvV = h('div', { width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', color: '#fff', fontFamily: 'IN4',
      backgroundColor: '#070b18', backgroundImage: 'radial-gradient(70% 90% at 100% 0%, #f2c14e77, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2fdc9855, transparent 60%)' },
      h('div', { justifyContent: 'space-between', alignItems: 'center' },
        h('div', { fontSize: 32, fontFamily: 'SG', gap: 10 }, h('span', {}, 'Rio de'), h('span', { color: '#ffd979' }, 'Prêmios')),
        h('div', { fontSize: 26, color: '#ffd979', padding: '10px 22px', borderRadius: 40, border: '2px solid #ffd97966' }, `Mega da Virada ${VIRADA.ano}`)),
      h('div', { fontSize: titulo.length > 28 ? 62 : 72, fontFamily: 'SG', letterSpacing: -2, maxWidth: 1080 }, titulo),
      corpoV,
      h('div', { fontSize: 28, color: '#c8d0e0' }, tipo === 'rende' ? 'Faça a sua simulação →' : tipo === 'bolao' ? 'Confira os jogos e o resultado no link →' : 'Gere os seus números também →'),
    );
    const imgV = await ImageResponse.async(arvV as any, { width: 1200, height: 675, format: 'png',
      fonts: [new CustomFont('SG', fonteV('sg700.woff'), { weight: 700 }), new CustomFont('IN4', fonteV('in400.woff'), { weight: 400 }), new CustomFont('IN6', fonteV('in600.woff'), { weight: 600 })] });
    const hv = new Headers(imgV.headers); hv.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    return new Response(imgV.body, { status: 200, headers: hv });
  }
  const slug = url.searchParams.get('l') ?? '';
  const n = Number(url.searchParams.get('n'));
  const db = getDB(locals);
  if (slug === 'rio-de-premios' && Number.isInteger(n) && n > 0) {
    // ---- Rio de Prêmios ----
    if (n < RP.baseEdicao || n >= proximaEdicao() + RP.edicoesFuturas) return new Response('edição não encontrada', { status: 404 });
    const e = Date.parse(isoSorteio(n)) + 3 * 3600e3 < Date.now(); // já sorteada
    const [y, m, d] = dataEdicao(n).split('-').map(Number);
    const fonte = (f: string) => () => env.ASSETS.fetch(new URL(`/og-fonts/${f}`, url)).then((r: Response) => r.arrayBuffer());
    const arv = h('div', {
      width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', color: '#fff', fontFamily: 'IN4',
      backgroundColor: '#04121a', backgroundImage: 'radial-gradient(60% 90% at 100% 0%, #2dd4bf88, transparent 60%), radial-gradient(50% 80% at 0% 100%, #f2c14e55, transparent 60%)',
    },
      h('div', { justifyContent: 'space-between', alignItems: 'center' },
        h('div', { fontSize: 30, fontFamily: 'SG', color: '#c8d0e0' }, 'riodepremios.com.br'),
        h('div', { fontSize: 26, color: '#c8d0e0', padding: '10px 22px', borderRadius: 40, border: '2px solid #ffffff33' }, e ? 'Sorteio realizado' : 'Próximo sorteio'),
      ),
      h('div', { flexDirection: 'column', gap: 8 },
        h('div', { fontSize: 40, color: '#5eead4', fontFamily: 'IN6' }, 'Loteria oficial do RJ'),
        h('div', { fontSize: 96, fontFamily: 'SG', letterSpacing: -3 }, `${RP.nome} ${n}`),
        h('div', { fontSize: 38, color: '#ffd979', fontFamily: 'IN6' }, `Domingo, ${pad(d)}/${pad(m)}/${y}`),
      ),
      h('div', { fontSize: 32, color: '#eef2fb', fontFamily: 'IN6' }, e ? 'Como conferir o resultado, bilhete e cadastro' : 'Como participar, bilhete, cadastro e resultado'),
    );
    const img = await ImageResponse.async(arv as any, { width: 1200, height: 675, format: 'png',
      fonts: [new CustomFont('SG', fonte('sg700.woff'), { weight: 700 }), new CustomFont('IN4', fonte('in400.woff'), { weight: 400 }), new CustomFont('IN6', fonte('in600.woff'), { weight: 600 })] });
    const hh = new Headers(img.headers); hh.set('Cache-Control', e ? 'public, max-age=86400, s-maxage=604800' : 'public, max-age=600, s-maxage=1800');
    return new Response(img.body, { status: 200, headers: hh });
  }
  const l = POR_SLUG[slug];
  if (!l || !Number.isInteger(n) || n < 1) return new Response('parâmetros inválidos', { status: 400 });

  const c = await concurso(db, l, n);
  const [ult] = c ? [null] : await ultimos(db, l, 1);
  const ehVirada = l.slug === 'mega-sena' && n === VIRADA.concurso;
  const prox = !c && ult && (ult.proximo_numero === n || (ehVirada && ult.numero < n)) ? ult : null;
  if (!c && !prox) return new Response('concurso não encontrado', { status: 404 });

  const dataIso = c ? c.data : ehVirada ? VIRADA.data.slice(0, 10) : prox!.proximo_data;
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
      h('div', { fontSize: 30, color: '#9aa6bf', fontFamily: 'IN6' }, ehVirada ? 'Prêmio estimado · Mega da Virada' : prox!.proximo_estimativa ? 'Prêmio estimado' : 'Sorteio às 20h'),
      h('div', { fontSize: ehVirada ? 92 : 104, color: '#ffd979', fontFamily: 'SG', letterSpacing: -3 }, ehVirada ? VIRADA.premioTexto.replace(/^mais de /, '+ de ') : prox!.proximo_estimativa ? reaisCurto(prox!.proximo_estimativa) : 'Hoje, 20h'),
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
      h('div', { fontSize: 34, color: '#c8d0e0' }, dia + (c ? '' : ehVirada ? ` · ${VIRADA.hora} (Brasília)` : ' · 20h (Brasília)')),
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
