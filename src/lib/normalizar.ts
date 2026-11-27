// Converte as respostas da API oficial da Caixa (ou da API comunitária de reserva)
// para o formato da tabela `concursos`. Usado pelo Worker coletor.
import { VIRADA } from './loterias';
export interface ConcursoRow {
  loteria: string; numero: number; data: string;
  dezenas: number[]; dezenas_ordem: number[] | null; dezenas2: number[] | null;
  extra: { time?: string; mes?: string; trevos?: number[] } | null;
  premiacoes: { faixa: number; descricao: string; ganhadores: number; premio: number }[];
  acumulado: boolean; arrecadacao: number | null;
  proximo_numero: number | null; proximo_data: string | null; proximo_estimativa: number | null;
  acumulado_especial: number | null; local: string | null;
  cidades_ganhadoras: { cidade: string; uf: string; ganhadores: number }[] | null;
  especial: boolean; fonte: string;
}

const isoDe = (br?: string | null) => {
  if (!br) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(br);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};
const nums = (a: unknown): number[] | null =>
  Array.isArray(a) && a.length ? a.map((x) => parseInt(String(x), 10)).filter((x) => !Number.isNaN(x)) : null;
const n = (v: unknown) => (v == null || v === '' ? null : Number(v));

export function normalizar(api: string, j: any, fonte: string): ConcursoRow | null {
  if (!j || typeof j !== 'object') return null;
  const numero = n(j.numero ?? j.concurso);
  const data = isoDe(j.dataApuracao ?? j.data);
  const dezenasBrutas = nums(j.listaDezenas ?? j.dezenas);
  if (!numero || !data || !dezenasBrutas) return null;

  const colunas = api === 'supersete';
  const dezenas = colunas ? dezenasBrutas : [...dezenasBrutas].sort((a, b) => a - b);
  const ordem = nums(j.dezenasSorteadasOrdemSorteio ?? j.dezenasOrdemSorteio);

  const extra: ConcursoRow['extra'] = {};
  const timeMes = j.nomeTimeCoracaoMesSorte ?? j.timeCoracao ?? j.mesSorte;
  if (timeMes && String(timeMes).trim()) {
    if (api === 'diadesorte') extra.mes = String(j.mesSorte ?? timeMes).trim();
    else if (api === 'timemania') extra.time = String(j.timeCoracao ?? timeMes).trim();
  }
  const trevos = nums(j.trevosSorteados ?? j.trevos);
  if (trevos) extra.trevos = trevos;

  const rateio = (j.listaRateioPremio ?? j.premiacoes ?? []) as any[];
  const premiacoes = rateio.map((r) => ({
    faixa: Number(r.faixa ?? 0),
    descricao: String(r.descricaoFaixa ?? r.descricao ?? ''),
    ganhadores: Number(r.numeroDeGanhadores ?? r.ganhadores ?? 0),
    premio: Number(r.valorPremio ?? 0),
  }));

  const cidadesBrutas = (j.listaMunicipioUFGanhadores ?? j.localGanhadores ?? []) as any[];
  const cidades = cidadesBrutas.map((c) => ({
    cidade: String(c.municipio ?? c.nomeMunicipio ?? '').trim(),
    uf: String(c.uf ?? '').trim(),
    ganhadores: Number(c.ganhadores ?? 1),
  })).filter((c) => c.cidade || c.uf);

  const local = [j.localSorteio ?? j.local, j.nomeMunicipioUFSorteio].filter(Boolean).join(' — ') || null;
  const especial = (api === 'megasena' && ((data.endsWith('-12-31') && data >= '2008-12-31') || numero === VIRADA.concurso)) || Number(j.indicadorConcursoEspecial) === 2;

  return {
    loteria: api, numero, data, dezenas, dezenas_ordem: ordem,
    dezenas2: nums(j.listaDezenasSegundoSorteio),
    extra: Object.keys(extra).length ? extra : null,
    premiacoes,
    acumulado: Boolean(j.acumulado ?? j.acumulou),
    arrecadacao: n(j.valorArrecadado),
    proximo_numero: n(j.numeroConcursoProximo ?? j.proximoConcurso),
    proximo_data: isoDe(j.dataProximoConcurso),
    proximo_estimativa: n(j.valorEstimadoProximoConcurso),
    acumulado_especial: n(j.valorAcumuladoConcursoEspecial),
    local, cidades_ganhadoras: cidades.length ? cidades : null, especial, fonte,
  };
}
