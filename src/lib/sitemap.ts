// Geração dos sitemaps com <lastmod> real (data do sorteio ou da última alteração do conteúdo).
import { LOTERIAS, POR_API, VIRADA } from './loterias';
import { GUIAS } from './guias';
import { SITE, CONTEUDO_ATUALIZADO } from './site';
import { RP, edicoesPublicadas, dataEdicao, proximaEdicao } from './riodepremios';

export type Url = { loc: string; lastmod: string };
const d10 = (s?: string | null) => (s ? s.slice(0, 10) : CONTEUDO_ATUALIZADO);
const max = (...xs: (string | undefined | null)[]) => xs.filter(Boolean).map((x) => d10(x)).sort().at(-1) ?? CONTEUDO_ATUALIZADO;

/** Nenhum lastmod pode estar no futuro. */
export const semFuturo = (d: string) => { const hoje = new Date().toISOString().slice(0, 10); return d > hoje ? hoje : d; };
export function xml(urls: Url[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE.url}${u.loc}</loc><lastmod>${semFuturo(u.lastmod)}</lastmod></url>`).join('\n')}\n</urlset>`;
}
async function q(db: any, sql: string, ...b: any[]) {
  try { return ((await db.prepare(sql).bind(...b).all()).results ?? []) as any[]; } catch { return []; }
}

/** Páginas (não concursos): fixas, hubs, arquivos por ano, Rio de Prêmios. */
export async function paginas(db: any): Promise<Url[]> {
  const porLot = await q(db, 'SELECT loteria, MAX(atualizado_em) a FROM concursos GROUP BY loteria');
  const atu = Object.fromEntries(porLot.map((r) => [r.loteria, d10(r.a)]));
  const anos = await q(db, "SELECT loteria, substr(data,1,4) ano, MAX(data) ult FROM concursos GROUP BY loteria, ano");
  const geral = max(...Object.values(atu) as string[]);
  const fixo = CONTEUDO_ATUALIZADO;
  const u: Url[] = [
    { loc: '/', lastmod: geral },
    ...['/estatisticas/', '/ferramentas/', '/guias/', '/sobre/', '/sobre/equipe-editorial/', '/metodologia/', '/jogo-responsavel/', '/contato/', '/politica-de-privacidade/', '/termos/',
      '/ferramentas/conferidor/', '/ferramentas/gerador-de-numeros/', '/ferramentas/calculadora-de-probabilidades/', '/ferramentas/calculadora-de-bolao/', '/ferramentas/premio-liquido/'].map((loc) => ({ loc, lastmod: fixo })),
    ...GUIAS.map((g) => ({ loc: `/guias/${g.slug}/`, lastmod: max(g.atualizado, fixo) })),
  ];
  for (const l of LOTERIAS) {
    const a = atu[l.api] ?? fixo;
    u.push({ loc: `/${l.slug}/`, lastmod: a }, { loc: `/${l.slug}/resultados/`, lastmod: a }, { loc: `/${l.slug}/como-jogar/`, lastmod: fixo });
    if (l.tipo !== 'colunas') u.push({ loc: `/${l.slug}/estatisticas/`, lastmod: a });
    for (const r of anos.filter((x) => x.loteria === l.api).sort((x, y) => Number(y.ano) - Number(x.ano))) u.push({ loc: `/${l.slug}/resultados/${r.ano}/`, lastmod: d10(r.ult) });
  }
  const viradas = await q(db, "SELECT MAX(data) d FROM concursos WHERE loteria='megasena' AND especial=1");
  const vir = max(VIRADA.atualizado, viradas[0]?.d);
  for (const p of ['', 'resultados/', 'estatisticas/', 'calculadora-de-bolao/', 'simulador/', 'gerador/', 'premio-liquido/', 'como-apostar/', 'seus-numeros/', 'bolao-online/', 'quanto-rende/'])
    u.push({ loc: `/mega-da-virada/${p}`, lastmod: p === 'resultados/' || p === 'estatisticas/' ? max(viradas[0]?.d) : vir });
  const prox = proximaEdicao();
  const rpAtu = dataEdicao(prox - 1);
  for (const p of ['', 'resultados/']) u.push({ loc: `/rio-de-premios/${p}`, lastmod: max(rpAtu, fixo) });
  for (const p of ['como-funciona/', 'bilhete-e-cadastro/', 'como-resgatar/']) u.push({ loc: `/rio-de-premios/${p}`, lastmod: fixo });
  return u;
}

/** Concursos: passados (data do sorteio, ou última atualização se recente), próximos e edições do Rio de Prêmios. */
export async function concursos(db: any): Promise<Url[]> {
  const u: Url[] = [];
  const hoje = Date.now();
  // próximos concursos (palpites): data da última atualização do concurso anterior
  const ult = await q(db, `SELECT c.loteria, c.proximo_numero, c.atualizado_em FROM concursos c JOIN (SELECT loteria, MAX(numero) m FROM concursos GROUP BY loteria) x
    ON c.loteria=x.loteria AND c.numero=x.m WHERE c.proximo_numero IS NOT NULL`);
  for (const r of ult) if (POR_API[r.loteria]) u.push({ loc: `/${POR_API[r.loteria].slug}/concurso/${r.proximo_numero}/`, lastmod: d10(r.atualizado_em) });
  if (!ult.some((r) => r.loteria === 'megasena' && r.proximo_numero === VIRADA.concurso)) {
    const tem = await q(db, "SELECT 1 FROM concursos WHERE loteria='megasena' AND numero=?", VIRADA.concurso);
    if (!tem.length) u.push({ loc: `/mega-sena/concurso/${VIRADA.concurso}/`, lastmod: VIRADA.atualizado });
  }
  // Rio de Prêmios: edição passada = data do sorteio; futura = data em que a página entrou (domingo anterior)
  const p = proximaEdicao();
  const entrouNoAr = p - 1 >= RP.baseEdicao ? dataEdicao(p - 1) : RP.publicado;
  for (const n of edicoesPublicadas().reverse()) u.push({ loc: `/rio-de-premios/edicao/${n}/`, lastmod: n < p ? dataEdicao(n) : entrouNoAr });
  // concursos já sorteados
  const rows = await q(db, 'SELECT loteria, numero, data, atualizado_em FROM concursos ORDER BY loteria, numero DESC LIMIT 48000');
  for (const r of rows) {
    if (!POR_API[r.loteria]) continue;
    const recente = hoje - Date.parse(r.data) < 3 * 864e5; // rateio pode ser atualizado nos primeiros dias
    u.push({ loc: `/${POR_API[r.loteria].slug}/concurso/${r.numero}/`, lastmod: recente ? max(r.data, r.atualizado_em) : r.data });
  }
  return u;
}
