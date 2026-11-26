import { normalizar, type ConcursoRow } from '../../../src/lib/normalizar';
import { LOTERIAS } from '../../../src/lib/loterias';

interface Env { DB: D1Database; RUN_TOKEN?: string }

const ORIGENS = [
  { nome: 'caixa', url: (api: string, n?: number) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}${n ? '/' + n : ''}` },
  { nome: 'reserva', url: (api: string, n?: number) => `https://loteriascaixa-api.herokuapp.com/api/${api}/${n ?? 'latest'}` },
  { nome: 'reserva2', url: (api: string, n?: number) => `https://api.guidi.dev.br/loteria/${api}/${n ?? 'ultimo'}` },
];
const HEADERS = { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (compatible; RioDePremiosBot/1.0)' };
const LIMITE_SUBREQ = 150; // plano Workers Paid (o gratuito permitia 50 por execução)

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

/** Hora de buscar os últimos resultados? A cada 10 min; a cada 2 min no horário dos sorteios (20h–22h59 de Brasília = 23h–01h59 UTC). */
function horaDeBuscarUltimos(agora = new Date()) {
  const h = agora.getUTCHours(), m = agora.getUTCMinutes();
  const sorteio = h === 23 || h === 0 || h === 1;
  return m % 10 === 0 || (sorteio && m % 2 === 0);
}

/**
 * Busca os últimos concursos (quando é hora) e completa o histórico de cima para baixo.
 * O avanço do histórico usa um marcador por loteria (tabela coletor_cursor), para não ler o banco inteiro a cada execução.
 */
async function executar(env: Env, historicoMax = 30, buscarUltimos = true) {
  usados = 0;
  const log: Record<string, unknown> = {};
  const ultimos: Record<string, number> = {};
  const erros: string[] = [];

  // 1) último concurso de cada loteria — grava um a um
  if (buscarUltimos) {
    for (const l of LOTERIAS) {
      try {
        const c = await buscar(l.api);
        if (c) { await gravar(env, c); ultimos[l.api] = c.numero; } else erros.push(`${l.api}: nenhuma fonte respondeu`);
      } catch (e) { erros.push(`${l.api}: ${String(e)}`); }
    }
    log.ultimos = ultimos;
  }
  // topo de cada loteria a partir do banco (consulta leve, usa o índice)
  const { results: tops } = await env.DB.prepare('SELECT loteria, MAX(numero) m FROM concursos GROUP BY loteria').all<{ loteria: string; m: number }>();
  for (const t of tops) if (!ultimos[t.loteria]) ultimos[t.loteria] = t.m;

  // 2) completa o histórico usando o marcador de cada loteria
  let gravados = 0;
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS coletor_cursor (loteria TEXT PRIMARY KEY, proximo INTEGER NOT NULL)').run();
    const { results: curs } = await env.DB.prepare('SELECT loteria, proximo FROM coletor_cursor').all<{ loteria: string; proximo: number }>();
    const cursor: Record<string, number> = Object.fromEntries(curs.map((c) => [c.loteria, c.proximo]));
    const porLoteria: [string, number][][] = [];
    for (const [api, topo] of Object.entries(ultimos)) {
      let c = cursor[api] ?? topo;
      if (c < 1) { porLoteria.push([]); continue; }
      // janela de até 20 números a partir do marcador: o que já existe é pulado
      const f: [string, number][] = [];
      for (let volta = 0; volta < 5 && f.length < 10 && c >= 1; volta++) {
        const ini = Math.max(1, c - 19);
        const { results: ex } = await env.DB.prepare('SELECT numero FROM concursos WHERE loteria=? AND numero BETWEEN ? AND ?').bind(api, ini, c).all<{ numero: number }>();
        const tem = new Set(ex.map((r) => r.numero));
        for (let n = c; n >= ini && f.length < 10; n--) if (!tem.has(n)) f.push([api, n]);
        if (f.length === 0) { c = ini - 1; cursor[api] = c; }
        else break;
      }
      porLoteria.push(f);
      if (f.length === 0) cursor[api] = c;
    }
    const faltando: [string, number][] = [];
    for (let i = 0; i < 10; i++) for (const f of porLoteria) if (f[i]) faltando.push(f[i]);
    const falhou = new Set<string>();
    for (const [api, n] of faltando.slice(0, historicoMax)) {
      if (usados >= LIMITE_SUBREQ || falhou.has(api)) break;
      const c = await buscar(api, n);
      if (c) { await gravar(env, c); gravados++; cursor[api] = Math.min(cursor[api] ?? n, n - 1); }
      else falhou.add(api); // não avança o marcador dessa loteria; tenta de novo na próxima execução
    }
    const st = env.DB.prepare('INSERT INTO coletor_cursor (loteria, proximo) VALUES (?1, ?2) ON CONFLICT(loteria) DO UPDATE SET proximo=excluded.proximo');
    await env.DB.batch(Object.entries(cursor).map(([api, n]) => st.bind(api, n)));
    log.marcadores = cursor;
  } catch (e) { erros.push('historico: ' + String(e)); }
  log.historico = gravados;
  log.requisicoes = usados;
  if (erros.length) log.erros = erros;
  if (buscarUltimos || gravados || erros.length) await registrar(env, JSON.stringify(log));
  return log;
}

export default {
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext) {
    const ultimos = horaDeBuscarUltimos();
    ctx.waitUntil(executar(env, ultimos ? 60 : 80, ultimos).catch((e) => registrar(env, 'falha: ' + String(e))));
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
