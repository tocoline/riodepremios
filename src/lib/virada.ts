import type { Concurso } from './db';
/** Prêmio principal efetivamente pago na Virada (se ninguém acerta 6, vai para a quina). */
export function premioPrincipal(c: Concurso) {
  const [sena, quina] = c.premiacoes;
  if (sena?.ganhadores) return { faixa: 'sena', ganhadores: sena.ganhadores, porGanhador: sena.premio, total: sena.premio * sena.ganhadores };
  if (quina) return { faixa: 'quina', ganhadores: quina.ganhadores, porGanhador: quina.premio, total: quina.premio * quina.ganhadores };
  return { faixa: '—', ganhadores: 0, porGanhador: 0, total: 0 };
}
export const anoDe = (c: Concurso) => Number(c.data.slice(0, 4)) - (c.data.slice(5, 7) === '01' ? 1 : 0);
