// Endereços do site antigo (WordPress) → páginas novas. Usado pelo middleware (1 salto, 301).
import { LOTERIAS } from './loterias';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// nome normalizado → slug novo (inclui grafias antigas: megasena, duplasena, maismilionaria, diadesorte…)
const NOMES: [string, string][] = [
  ...LOTERIAS.map((l) => [norm(l.slug), l.slug] as [string, string]),
  ['milionaria', 'mais-milionaria'], ['mega', 'mega-sena'], ['dupla', 'dupla-sena'], ['supersete', 'super-sete'],
].sort((a, b) => b[0].length - a[0].length); // mais longo primeiro (maismilionaria antes de milionaria)

/** Encontra a loteria citada num trecho de URL. */
export function loteriaDe(texto: string): string | null {
  const t = norm(texto);
  for (const [n, slug] of NOMES) if (t.includes(n)) return slug;
  return null;
}

/** Número do concurso num slug: o primeiro grupo de 3 a 5 dígitos que não seja um ano (19xx/20xx). */
function numeroDe(texto: string): number | null {
  for (const m of texto.matchAll(/(\d{3,5})/g)) {
    const n = Number(m[1]);
    if (m[1].length === 4 && n >= 1990 && n <= 2099) continue;
    return n;
  }
  return null;
}

/** Artigos antigos com equivalente no site novo. */
export const ARTIGOS: Record<string, string> = {
  'como-cadastrar-um-bilhete': '/rio-de-premios/bilhete-e-cadastro/',
};
/** Artigos fora do tema removidos de propósito. */
const REMOVIDOS = ['/stranger-things-mac/', '/filamento-3d-barato-rj/'];

export type Acao = { tipo: 'redirect'; para: string } | { tipo: 'gone' } | null;

/** Decide o que fazer com um caminho antigo. Retorna null quando não é um endereço legado. */
export function legado(caminho: string): Acao {
  let p: string;
  try { p = decodeURIComponent(caminho).toLowerCase(); } catch { p = caminho.toLowerCase(); }
  const comBarra = p.endsWith('/') ? p : p + '/';

  // arquivos do WordPress: 410
  if (/^\/wp-(content|includes|admin|json)(\/|$)/.test(p) || /^\/wp-[^/]*\.php$/.test(p) || p === '/xmlrpc.php') return { tipo: 'gone' };
  if (REMOVIDOS.includes(comBarra)) return { tipo: 'gone' };

  // feeds
  if (/^\/(.*\/)?feed\/?$/.test(p) || /^\/comments\/feed\/?$/.test(p)) return { tipo: 'redirect', para: '/' };

  // /{loteria}-noticia-concurso-{N}/, /{loteria}-preview-concurso-{N}/, /{loteria}-acumulada-{N}-*/
  let m = /^\/([a-z0-9+-]+?)-(?:noticia|preview)-concurso-(\d+)\/?$/.exec(p) ?? /^\/([a-z0-9+-]+?)-acumulada-(\d+)(?:-[^/]*)?\/?$/.exec(p);
  if (m) {
    const lot = loteriaDe(m[1]);
    return { tipo: 'redirect', para: lot ? `/${lot}/concurso/${Number(m[2])}/` : '/' };
  }

  // /loteria_resultado/* e /loteria_palpites/*
  m = /^\/loteria_(?:resultado|resultados|palpites|palpite)\/(.*)$/.exec(p);
  if (m) {
    const lot = loteriaDe(m[1]);
    if (!lot) return { tipo: 'redirect', para: '/' };
    const n = numeroDe(m[1]);
    return { tipo: 'redirect', para: n ? `/${lot}/concurso/${n}/` : `/${lot}/` };
  }

  // /resultado/{loteria}-concurso-{N}/ (formato antigo de resultado)
  m = /^\/resultado\/([^/]+)\/?$/.exec(p);
  if (m) {
    const lot = loteriaDe(m[1]);
    if (/rio-?de-?premios/.test(m[1])) return { tipo: 'redirect', para: '/rio-de-premios/resultados/' };
    const n = numeroDe(m[1]);
    return { tipo: 'redirect', para: lot ? (n ? `/${lot}/concurso/${n}/` : `/${lot}/`) : '/' };
  }

  // /category/{loteria}/ (inclusive /page/N/)
  m = /^\/category\/([^/]+)(?:\/.*)?$/.exec(p);
  if (m) {
    const lot = loteriaDe(m[1]);
    return { tipo: 'redirect', para: lot ? `/${lot}/` : /rio-?de-?premios/.test(m[1]) ? '/rio-de-premios/' : '/' };
  }

  // /artigo/{slug}
  m = /^\/artigo\/([^/]+)\/?$/.exec(p);
  if (m) {
    const destino = ARTIGOS[m[1]] ?? (/rio-de-premios|bilhete|cadastr/.test(m[1]) ? '/rio-de-premios/' : null);
    return { tipo: 'redirect', para: destino ?? '/guias/' };
  }

  if (comBarra === '/privacidade/' || comBarra === '/politica-privacidade/' || comBarra === '/privacy-policy/') return { tipo: 'redirect', para: '/politica-de-privacidade/' };
  if (comBarra === '/termos-de-uso/') return { tipo: 'redirect', para: '/termos/' };
  if (comBarra === '/sobre-nos/' || comBarra === '/quem-somos/') return { tipo: 'redirect', para: '/sobre/' };

  // /tag/... e /author/... do WordPress
  if (/^\/author\/[^/]+/.test(p)) return { tipo: 'redirect', para: '/sobre/equipe-editorial/' };
  if (/^\/tag\/[^/]+/.test(p)) return { tipo: 'redirect', para: '/' };

  return null;
}
