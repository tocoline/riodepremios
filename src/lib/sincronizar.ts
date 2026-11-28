// Busca um concurso na Caixa (ou fonte reserva) e grava no D1. Usado quando uma página de concurso
// antigo é visitada antes de o coletor completar o histórico, e como reserva do coletor quando o
// endpoint "último resultado" da Caixa demora a virar (o endereço do concurso específico costuma já ter o dado).
import { normalizar, type ConcursoRow } from './normalizar';
import { LOTERIAS, VIRADA, type Loteria } from './loterias';
import { SITE } from './site';

const ORIGENS = [
  { nome: 'caixa', url: (api: string, n: number) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}/${n}` },
  { nome: 'reserva', url: (api: string, n: number) => `https://loteriascaixa-api.herokuapp.com/api/${api}/${n}` },
  { nome: 'reserva2', url: (api: string, n: number) => `https://api.guidi.dev.br/loteria/${api}/${n}` },
];

export const SQL_GRAVAR = `INSERT INTO concursos (loteria, numero, data, dezenas, dezenas_ordem, dezenas2, extra, premiacoes, acumulado, arrecadacao,
  proximo_numero, proximo_data, proximo_estimativa, acumulado_especial, local, cidades_ganhadoras, especial, fonte, atualizado_em)
  VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)
  ON CONFLICT(loteria, numero) DO NOTHING`;
// mesma gravação, mas substituindo (para completar um rateio que a Caixa ainda não tinha divulgado)
const SQL_ATUALIZAR = SQL_GRAVAR.replace('DO NOTHING', `DO UPDATE SET dezenas=excluded.dezenas, dezenas_ordem=excluded.dezenas_ordem, dezenas2=excluded.dezenas2,
  extra=excluded.extra, premiacoes=excluded.premiacoes, acumulado=excluded.acumulado, arrecadacao=excluded.arrecadacao, proximo_numero=excluded.proximo_numero,
  proximo_data=excluded.proximo_data, proximo_estimativa=excluded.proximo_estimativa, acumulado_especial=excluded.acumulado_especial, local=excluded.local,
  cidades_ganhadoras=excluded.cidades_ganhadoras, especial=excluded.especial, fonte=excluded.fonte, atualizado_em=excluded.atualizado_em`);
const js = (v: unknown) => (v == null ? null : JSON.stringify(v));

export async function buscarConcurso(l: Loteria, n: number): Promise<ConcursoRow | null> {
  for (const o of ORIGENS) {
    try {
      const r = await fetch(o.url(l.api, n), { headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (compatible; RioDePremiosBot/1.0)' }, signal: AbortSignal.timeout(6000) });
      if (!r.ok) continue;
      const row = normalizar(l.api, await r.json(), o.nome);
      if (row && row.numero === n) return row;
    } catch { /* tenta a próxima fonte */ }
  }
  return null;
}

export async function sincronizar(db: any, l: Loteria, n: number, substituir = false): Promise<boolean> {
  if (!db) return false;
  const c = await buscarConcurso(l, n);
  if (!c) return false;
  if (substituir && !rateioCompleto(c.premiacoes)) return false; // nada novo a gravar
  await db.prepare(substituir ? SQL_ATUALIZAR : SQL_GRAVAR).bind(c.loteria, c.numero, c.data, js(c.dezenas), js(c.dezenas_ordem), js(c.dezenas2), js(c.extra),
    js(c.premiacoes), c.acumulado ? 1 : 0, c.arrecadacao, c.proximo_numero, c.proximo_data, c.proximo_estimativa,
    c.acumulado_especial, c.local, js(c.cidades_ganhadoras), c.especial ? 1 : 0, c.fonte, new Date().toISOString()).run();
  return true;
}

const BRASILIA = 3 * 3600e3;
const brasilia = (t: number) => new Date(t - BRASILIA).toISOString();

/** Rateio já divulgado? Logo após o sorteio a Caixa publica as dezenas com todas as faixas zeradas. */
export function rateioCompleto(premiacoes: { ganhadores: number }[] | null | undefined) {
  return !!premiacoes?.length && premiacoes.some((p) => p.ganhadores > 0);
}

/** Hora (Brasília) a partir da qual o resultado do concurso já deve estar publicado. */
function horaLimite(api: string, numero: number, data: string) {
  if (api === 'megasena' && numero === VIRADA.concurso) return Number(brasilia(new Date(VIRADA.data).getTime()).slice(11, 13)) + 1; // Virada: 11h → 12h
  return new Date(data + 'T12:00:00Z').getUTCDay() === 0 ? 12 : 21; // domingos têm sorteio às 11h; nos outros dias, às 20h
}

/** O próximo concurso já devia ter resultado publicado? */
export function resultadoAtrasado(u: { numero: number; proximo_numero: number | null; proximo_data: string | null } | null | undefined, api = '', agora = Date.now()) {
  if (!u?.proximo_numero || !u.proximo_data || u.proximo_numero !== u.numero + 1) return false;
  const br = brasilia(agora);
  const hoje = br.slice(0, 10), hora = Number(br.slice(11, 13));
  const limite = brasilia(agora - 10 * 86400e3).slice(0, 10); // não insiste em datas muito antigas
  return u.proximo_data > limite && (u.proximo_data < hoje || (u.proximo_data === hoje && hora >= horaLimite(api, u.proximo_numero, u.proximo_data)));
}

const INTERVALO = 3 * 60e3;
let ultimaVerificacao = 0;
/**
 * Em segundo plano (middleware), no máximo a cada 3 min por isolate:
 * - loteria com resultado atrasado: busca o concurso específico e grava;
 * - último concurso dos últimos 2 dias ainda sem rateio: busca de novo e completa.
 */
export async function completarAtrasados(db: any, host: string) {
  if (!db || host !== new URL(SITE.url).host || Date.now() - ultimaVerificacao < INTERVALO) return;
  ultimaVerificacao = Date.now();
  try {
    const res = await db.batch(LOTERIAS.map((l) => db.prepare('SELECT numero, data, premiacoes, proximo_numero, proximo_data FROM concursos WHERE loteria=? ORDER BY numero DESC LIMIT 1').bind(l.api)));
    const doisDias = brasilia(Date.now() - 2 * 86400e3).slice(0, 10);
    await Promise.all(LOTERIAS.map(async (l, i) => {
      const u = (res[i]?.results ?? [])[0];
      if (!u) return;
      if (resultadoAtrasado(u, l.api)) {
        if (await sincronizar(db, l, u.proximo_numero)) console.log('sincronizado pelo site', l.api, u.proximo_numero);
        return;
      }
      let pr: any[] = []; try { pr = JSON.parse(u.premiacoes || '[]'); } catch { /* sem rateio */ }
      if (u.data >= doisDias && !rateioCompleto(pr) && (await sincronizar(db, l, u.numero, true))) console.log('rateio completado pelo site', l.api, u.numero);
    }));
  } catch (e) { console.error('completarAtrasados', String(e)); }
}
