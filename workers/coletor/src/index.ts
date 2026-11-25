import { normalizar, type ConcursoRow } from '../../../src/lib/normalizar';
import { LOTERIAS } from '../../../src/lib/loterias';

interface Env { DB: D1Database; RUN_TOKEN?: string }

const ORIGENS = [
  { nome: 'caixa', url: (api: string, n?: number) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}${n ? '/' + n : ''}` },
  { nome: 'reserva', url: (api: string, n?: number) => `https://loteriascaixa-api.herokuapp.com/api/${api}/${n ?? 'latest'}` },
  { nome: 'reserva2', url: (api: string, n?: number) => `https://api.guidi.dev.br/loteria/${api}/${n ?? 'ultimo'}` },
];
const HEADERS = { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (compatible; RioDePremiosBot/1.0)' };
const LIMITE_SUBREQ = 45; // plano gratuito: 50 por execução

let usados = 0;
async function buscar(api: string, n?: number): Promise<ConcursoRow | null> {
  for (const o of ORIGENS) {
    if (usados >= LIMITE_SUBREQ) return null;
    usados++;
    try {
      const r = await fetch(o.url(api, n), {
        headers: HEADERS,
        cf: { cacheTtl: 0 },
      });
      if (!r.ok) continue;
      const row = normalizar(api, await r.json(), o.nome);
      if (row && (!n || row.numero === n)) return row;
    } catch (e) { console.warn(o.nome, api, n, String(e)); }
  }
  return null;
}

const SQL = `INSERT INTO concursos (loteria, numero, data, dezenas, dezenas_ordem, dezenas2, extra, premiacoes, acumulado, arrecadacao,
  proximo_numero, proximo_data, proximo_estimativa, acumulado_especial, local, cidades_ganhadoras, especial, fonte, atualizado_em)
  VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)
  ON CONFLICT(loteria, numero) DO UPDATE SET data=excluded.data, dezenas=excluded.dezenas, dezenas_ordem=excluded.dezenas_ordem,
  dezenas2=excluded.dezenas2, extra=excluded.extra, premiacoes=excluded.premiacoes, acumulado=excluded.acumulado,
  arrecadacao=excluded.arrecadacao, proximo_numero=excluded.proximo_numero, proximo_data=excluded.proximo_data,
  proximo_estimativa=excluded.proximo_estimativa, acumulado_especial=excluded.acumulado_especial, local=excluded.local,
  cidades_ganhadoras=excluded.cidades_ganhadoras, especial=excluded.especial, fonte=excluded.fonte, atualizado_em=excluded.atualizado_em`;

const js = (v: unknown) => (v == null ? null : JSON.stringify(v));
function stmt(db: D1Database, c: ConcursoRow) {
  return db.prepare(SQL).bind(c.loteria, c.numero, c.data, js(c.dezenas), js(c.dezenas_ordem), js(c.dezenas2), js(c.extra),
    js(c.premiacoes), c.acumulado ? 1 : 0, c.arrecadacao, c.proximo_numero, c.proximo_data, c.proximo_estimativa,
    c.acumulado_especial, c.local, js(c.cidades_ganhadoras), c.especial ? 1 : 0, c.fonte, new Date().toISOString());
}

async function executar(env: Env) {
  usados = 0;
  const log: Record<string, unknown> = {};
  const novos: ConcursoRow[] = [];
  const ultimos: Record<string, number> = {};

  // 1) último concurso de cada loteria
  for (const l of LOTERIAS) {
    const c = await buscar(l.api);
    if (c) { novos.push(c); ultimos[l.api] = c.numero; }
  }
  if (novos.length) await env.DB.batch(novos.map((c) => stmt(env.DB, c)));
  log.ultimos = ultimos;

  // 2) completa o histórico (do mais recente para o mais antigo), dentro do limite de requisições
  const faltando: Record<string, number[]> = {};
  for (const l of LOTERIAS) {
    const topo = ultimos[l.api];
    if (!topo) continue;
    const { results } = await env.DB.prepare('SELECT numero FROM concursos WHERE loteria=?').bind(l.api).all<{ numero: number }>();
    const tem = new Set(results.map((r) => r.numero));
    const f: number[] = [];
    for (let n = topo; n >= 1 && f.length < 40; n--) if (!tem.has(n)) f.push(n);
    if (f.length) faltando[l.api] = f;
  }
  const historico: ConcursoRow[] = [];
  let rodada = 0;
  while (usados < LIMITE_SUBREQ && Object.values(faltando).some((f) => f.length > rodada)) {
    for (const [api, f] of Object.entries(faltando)) {
      if (usados >= LIMITE_SUBREQ) break;
      const n = f[rodada];
      if (n === undefined) continue;
      const c = await buscar(api, n);
      if (c) historico.push(c);
    }
    rodada++;
  }
  if (historico.length) await env.DB.batch(historico.map((c) => stmt(env.DB, c)));
  log.historico = historico.length;
  log.requisicoes = usados;
  return log;
}

export default {
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(executar(env).then((l) => console.log(JSON.stringify(l))));
  },
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (url.pathname === '/status') {
      const { results } = await env.DB.prepare('SELECT loteria, COUNT(*) total, MAX(numero) ultimo, MAX(atualizado_em) atualizado FROM concursos GROUP BY loteria').all();
      return Response.json(results);
    }
    if (url.pathname === '/diag') {
      // diagnóstico: o que cada fonte responde para a Mega-Sena
      const out = [];
      for (const o of ORIGENS) {
        const u = o.url('megasena');
        try {
          const r = await fetch(u, { headers: HEADERS, cf: { cacheTtl: 0 } });
          const txt = await r.text();
          let ok = false;
          try { ok = !!normalizar('megasena', JSON.parse(txt), o.nome); } catch {}
          out.push({ fonte: o.nome, url: u, status: r.status, interpretou: ok, inicio: txt.slice(0, 300) });
        } catch (e) { out.push({ fonte: o.nome, url: u, erro: String(e) }); }
      }
      return Response.json(out);
    }
    if (url.pathname === '/run') {
      if (!env.RUN_TOKEN || url.searchParams.get('token') !== env.RUN_TOKEN) return new Response('não autorizado', { status: 401 });
      return Response.json(await executar(env));
    }
    return new Response('Rio de Prêmios — coletor de resultados', { status: 200 });
  },
};
