// Dados dos fechamentos para as páginas estáticas (os mesmos arquivos que a ferramenta baixa).
import lotofacil from '../../public/fechamentos/lotofacil.json';
import mega from '../../public/fechamentos/mega-sena.json';
import type { Arquivo, Fechamento } from './fechamento';

export const ARQUIVOS: Record<string, Arquivo> = { lotofacil: lotofacil as Arquivo, 'mega-sena': mega as Arquivo };

/** Fechamentos de v dezenas, sem repetir garantias equivalentes (mesmo nº de jogos e garantia mais fraca são descartados). */
export function opcoes(loteria: string, v: number): Fechamento[] {
  const fs = ARQUIVOS[loteria].fechamentos.filter((f) => f.v === v);
  // uma garantia "domina" outra quando é ao menos tão forte e não custa mais jogos
  return fs.filter((f) => !fs.some((g) => g !== f && g.n <= f.n && g.m <= f.m && g.t >= f.t && (g.n < f.n || g.m < f.m || g.t > f.t)));
}
