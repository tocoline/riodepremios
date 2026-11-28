// Mensagens prontas para compartilhar no WhatsApp (negrito com *asteriscos*, que o WhatsApp entende).
import type { Loteria } from './loterias';
import type { Concurso } from './db';
import { SITE } from './site';
import { pad, reais, reaisCurto, numero, diaMes, DIAS_CURTOS } from './format';

/** Link com marcação de campanha, para medir no Analytics as visitas vindas do WhatsApp. */
export function linkZap(path: string, campanha: string) {
  const u = new URL(path, SITE.url);
  u.searchParams.set('utm_source', 'whatsapp');
  u.searchParams.set('utm_medium', 'compartilhar');
  u.searchParams.set('utm_campaign', campanha);
  return u.href;
}

export function hrefWhatsApp(texto: string) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

const dia = (iso: string) => `${DIAS_CURTOS[new Date(iso + 'T12:00:00Z').getUTCDay()]}, ${diaMes(iso)}`;

/** Resultado de um concurso já sorteado. */
export function mensagemResultado(l: Loteria, c: Concurso, nomeEspecial?: string) {
  const dig = l.tipo === 'colunas' ? 1 : 2;
  const linhas = [`🍀 *Resultado ${nomeEspecial ? `${nomeEspecial} (concurso ${c.numero})` : `da ${l.nome} ${c.numero}`}* (${dia(c.data)})`, '', `*${c.dezenas.map((d) => pad(d, dig)).join(' - ')}*`];
  if (c.dezenas2) linhas.push(`2º sorteio: *${c.dezenas2.map((d) => pad(d)).join(' - ')}*`);
  if (c.extra?.trevos) linhas.push(`Trevos: *${c.extra.trevos.join(' e ')}*`);
  if (c.extra?.time) linhas.push(`Time do Coração: *${c.extra.time}*`);
  if (c.extra?.mes) linhas.push(`Mês da Sorte: *${c.extra.mes}*`);
  linhas.push('');
  const f = c.premiacoes[0];
  if (f?.ganhadores) linhas.push(`💰 ${numero(f.ganhadores)} aposta${f.ganhadores > 1 ? 's acertaram' : ' acertou'} a faixa principal: *${reais(f.premio)}*${f.ganhadores > 1 ? ' cada' : ''}`);
  else if (nomeEspecial?.includes('Virada') && c.premiacoes[1]?.ganhadores) linhas.push(`💰 Ninguém acertou a sena: o prêmio foi dividido entre *${numero(c.premiacoes[1].ganhadores)} quinas*, ${reais(c.premiacoes[1].premio)} cada`);
  else if (c.premiacoes.some((p) => p.ganhadores > 0)) linhas.push(`😮 *Acumulou!*${c.proximo_estimativa ? ` Próximo prêmio estimado: *${reaisCurto(c.proximo_estimativa)}*` : ''}`);
  linhas.push('👉 Confira os prêmios e se você ganhou:');
  return linhas.join('\n');
}

/** Próximo concurso, ainda não sorteado. */
export function mensagemProximo(l: Loteria, numeroConcurso: number, data: string | null, premio?: string | null) {
  return [`⏳ *${l.nome} ${numeroConcurso}*${data ? ` sorteia ${dia(data)}` : ''}${premio ? ` — prêmio estimado de *${premio}*` : ''}.`, '', '🔮 Palpites e o resultado assim que sair:'].join('\n');
}
