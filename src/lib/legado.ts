// Redirecionamentos dos endereços do site antigo (WordPress) para as páginas novas.
import { LOTERIAS } from './loterias';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const POR_NOME = Object.fromEntries(LOTERIAS.map((l) => [norm(l.slug), l.slug]));
POR_NOME['milionaria'] = 'mais-milionaria';

/** /resultado/lotofacil-concurso-3671/ → /lotofacil/concurso/3671/ */
export function destinoResultado(slug: string): string | null {
  const m = /^(.*?)-?concurso-?(\d+)$/.exec(slug.toLowerCase());
  const nome = norm(m ? m[1] : slug);
  const lot = POR_NOME[nome];
  if (lot && m) return `/${lot}/concurso/${Number(m[2])}/`;
  if (lot) return `/${lot}/`;
  if (nome.includes('riodepremios')) return '/rio-de-premios/resultados/';
  return null;
}

/** Artigos antigos com equivalente no site novo. */
export const ARTIGOS: Record<string, string> = {
  'como-cadastrar-um-bilhete': '/rio-de-premios/bilhete-e-cadastro/',
};
/** Artigos fora do tema removidos de propósito (410). */
export const REMOVIDOS = ['/stranger-things-mac/', '/filamento-3d-barato-rj/'];
