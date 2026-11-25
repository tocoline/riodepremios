// Rio de Prêmios — loteria oficial do Estado do Rio de Janeiro (LOTERJ).
// Não há API pública: os resultados são cadastrados em /admin/rio-de-premios/.
// Ajuste aqui os dados que mudam. Confirme sempre no regulamento oficial.
export const RP = {
  nome: 'Rio de Prêmios',
  siteOficial: 'https://www.riodepremiosoficial.com.br',
  cor: '#0ea5a4',
  cor2: '#f2c14e',
  // edição de referência: a edição 109 é sorteada no domingo 29/11/2026
  baseEdicao: 109,
  baseData: '2026-11-29',
  intervaloDias: 7,
  hora: '09:00', // horário de Brasília (confirme na divulgação oficial)
  preco: null as number | null, // ex.: 5 — deixe null para não exibir
  edicoesFuturas: 2, // quantas edições futuras já ganham página
};

const DIA = 864e5;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const t0 = Date.parse(RP.baseData + 'T12:00:00Z');

/** Data (yyyy-mm-dd) de uma edição pela regra semanal. */
export function dataEdicao(n: number) { return iso(t0 + (n - RP.baseEdicao) * RP.intervaloDias * DIA); }
export function isoSorteio(n: number) { return `${dataEdicao(n)}T${RP.hora}:00-03:00`; }

/** Próxima edição ainda não sorteada (considerando o horário do sorteio + 3h de margem). */
export function proximaEdicao(agora = Date.now()) {
  let n = RP.baseEdicao + Math.floor((agora - t0) / (RP.intervaloDias * DIA));
  if (n < RP.baseEdicao) n = RP.baseEdicao;
  while (Date.parse(isoSorteio(n)) + 3 * 3600e3 < agora) n++;
  while (n > RP.baseEdicao && Date.parse(isoSorteio(n - 1)) + 3 * 3600e3 >= agora) n--;
  return n;
}

export interface Sorteio { nome: string; premio?: string; dezenas: number[]; ganhadores?: string[] }
export interface Edicao { edicao: number; data: string; sorteios: Sorteio[]; observacoes?: string | null; atualizado_em: string }
