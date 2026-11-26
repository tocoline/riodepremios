// Busca um concurso na Caixa (ou fonte reserva) e grava no D1 — usado quando uma página
// de concurso antigo é visitada antes de o coletor completar o histórico.
import { normalizar, type ConcursoRow } from './normalizar';
import type { Loteria } from './loterias';

const ORIGENS = [
  { nome: 'caixa', url: (api: string, n: number) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}/${n}` },
  { nome: 'reserva', url: (api: string, n: number) => `https://loteriascaixa-api.herokuapp.com/api/${api}/${n}` },
  { nome: 'reserva2', url: (api: string, n: number) => `https://api.guidi.dev.br/loteria/${api}/${n}` },
];

export const SQL_GRAVAR = `INSERT INTO concursos (loteria, numero, data, dezenas, dezenas_ordem, dezenas2, extra, premiacoes, acumulado, arrecadacao,
  proximo_numero, proximo_data, proximo_estimativa, acumulado_especial, local, cidades_ganhadoras, especial, fonte, atualizado_em)
  VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)
  ON CONFLICT(loteria, numero) DO NOTHING`;
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

export async function sincronizar(db: any, l: Loteria, n: number): Promise<boolean> {
  if (!db) return false;
  const c = await buscarConcurso(l, n);
  if (!c) return false;
  await db.prepare(SQL_GRAVAR).bind(c.loteria, c.numero, c.data, js(c.dezenas), js(c.dezenas_ordem), js(c.dezenas2), js(c.extra),
    js(c.premiacoes), c.acumulado ? 1 : 0, c.arrecadacao, c.proximo_numero, c.proximo_data, c.proximo_estimativa,
    c.acumulado_especial, c.local, js(c.cidades_ganhadoras), c.especial ? 1 : 0, c.fonte, new Date().toISOString()).run();
  return true;
}
