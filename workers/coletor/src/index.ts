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

async function gravar(env: Env, c: ConcursoRow) { await stmt(env.DB, c).run(); }

async function registrar(env: Env, msg: string) {
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS coletor_log (quando TEXT, mensagem TEXT)').run();
    await env.DB.prepare('INSERT INTO coletor_log VALUES (?1, ?2)').bind(new Date().toISOString(), msg.slice(0, 2000)).run();
    await env.DB.prepare('DELETE FROM coletor_log WHERE rowid NOT IN (SELECT rowid FROM coletor_log ORDER BY quando DESC LIMIT 50)').run();
  } catch (e) { console.error('log', String(e)); }
}

/** Busca o último concurso de cada loteria e completa o histórico (até `historicoMax` concursos por execução). */
async function executar(env: Env, historicoMax = 30) {
  usados = 0;
  const log: Record<string, unknown> = {};
  const ultimos: Record<string, number> = {};
  const erros: string[] = [];

  // 1) último concurso de cada loteria — grava um a um
  for (const l of LOTERIAS) {
    try {
      const c = await buscar(l.api);
      if (c) { await gravar(env, c); ultimos[l.api] = c.numero; } else erros.push(`${l.api}: nenhuma fonte respondeu`);
    } catch (e) { erros.push(`${l.api}: ${String(e)}`); }
  }
  log.ultimos = ultimos;

  // 2) completa o histórico (do mais recente para o mais antigo)
  let gravados = 0;
  try {
    const { results } = await env.DB.prepare('SELECT loteria, numero FROM concursos').all<{ loteria: string; numero: number }>();
    const tem = new Set(results.map((r) => r.loteria + ':' + r.numero));
    // até 6 faltantes por loteria, intercalados (rodízio) para todas avançarem juntas
    const porLoteria: [string, number][][] = [];
    for (const [api, topo] of Object.entries(ultimos)) {
      const f: [string, number][] = [];
      for (let n = topo; n >= 1 && f.length < 6; n--) if (!tem.has(api + ':' + n)) f.push([api, n]);
      porLoteria.push(f);
    }
    const faltando: [string, number][] = [];
    for (let i = 0; i < 6; i++) for (const f of porLoteria) if (f[i]) faltando.push(f[i]);
    for (const [api, n] of faltando.slice(0, historicoMax)) {
      if (usados >= LIMITE_SUBREQ) break;
      const c = await buscar(api, n);
      if (c) { await gravar(env, c); gravados++; }
    }
  } catch (e) { erros.push('historico: ' + String(e)); }
  log.historico = gravados;
  log.requisicoes = usados;
  if (erros.length) log.erros = erros;
  await registrar(env, JSON.stringify(log));
  return log;
}

export default {
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(executar(env).catch((e) => registrar(env, 'falha: ' + String(e))));
  },
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (url.pathname === '/status') {
      const { results } = await env.DB.prepare('SELECT loteria, COUNT(*) total, MAX(numero) ultimo, MAX(atualizado_em) atualizado FROM concursos GROUP BY loteria').all();
      let execucoes: unknown[] = [];
      try { execucoes = (await env.DB.prepare('SELECT * FROM coletor_log ORDER BY quando DESC LIMIT 10').all()).results; } catch {}
      return Response.json({ loterias: results, execucoes });
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
    if (url.pathname === '/teste') {
      // teste público e inofensivo: busca e grava só o último concurso da Mega-Sena
      usados = 0;
      try {
        const c = await buscar('megasena');
        if (!c) return Response.json({ ok: false, erro: 'nenhuma fonte respondeu' });
        await gravar(env, c);
        return Response.json({ ok: true, gravado: { numero: c.numero, data: c.data, dezenas: c.dezenas, fonte: c.fonte } });
      } catch (e) { return Response.json({ ok: false, erro: String(e) }, { status: 500 }); }
    }
    if (url.pathname === '/run') {
      if (!env.RUN_TOKEN || url.searchParams.get('token') !== env.RUN_TOKEN) return new Response('não autorizado', { status: 401 });
      return Response.json(await executar(env, Number(url.searchParams.get('historico')) || 30));
    }
    return new Response('Rio de Prêmios — coletor de resultados', { status: 200 });
  },
};
