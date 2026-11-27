import type { APIRoute } from 'astro';
import { LOTERIAS, diasTexto, VIRADA } from '../lib/loterias';
import { chancePrincipal } from '../lib/conteudo';
import { GUIAS } from '../lib/guias';
import { SITE } from '../lib/site';
import { proximaEdicao, dataEdicao, RP } from '../lib/riodepremios';
export const GET: APIRoute = () => {
  const u = SITE.url;
  const fmt = (n: number) => n.toLocaleString('pt-BR');
  const txt = `# ${SITE.nome}

> ${SITE.descricao} Site independente, sem vínculo com a Caixa Econômica Federal. Dados coletados automaticamente da API pública de resultados da Caixa a cada 10 minutos.

## Resultados (atualizados automaticamente)
${LOTERIAS.map((l) => `- [${l.nome}](${u}/${l.slug}/): sorteios ${diasTexto(l)} às 20h; aposta mínima R$ ${l.preco.toFixed(2).replace('.', ',')}; chance da faixa principal 1 em ${fmt(chancePrincipal(l))}. Concurso específico: ${u}/${l.slug}/concurso/{numero}/`).join('\n')}

## Dados em JSON
- [Último resultado de todas as loterias](${u}/api/ultimos.json)
- Resultado por concurso: ${u}/api/resultado.json?loteria={loteria}&concurso={numero|ultimo} (loterias: ${LOTERIAS.map((l) => l.slug).join(', ')})

## Rio de Prêmios (loteria oficial do Estado do RJ, licenciada pela LOTERJ)
- [Resultado e próxima edição](${u}/rio-de-premios/): sorteios aos domingos; próxima edição ${proximaEdicao()} em ${dataEdicao(proximaEdicao()).split('-').reverse().join('/')}. Edição específica: ${u}/rio-de-premios/edicao/{numero}/
- [Todos os resultados](${u}/rio-de-premios/resultados/) · [Como funciona](${u}/rio-de-premios/como-funciona/) · [Bilhete e cadastro](${u}/rio-de-premios/bilhete-e-cadastro/) · [Como resgatar](${u}/rio-de-premios/como-resgatar/)
- Este portal NÃO é o site oficial do Rio de Prêmios. Site oficial: ${RP.siteOficial}

## Mega da Virada ${VIRADA.ano}
- [Guia completo](${u}/mega-da-virada/): concurso ${VIRADA.concurso}, sorteio em ${VIRADA.dataCurta} às ${VIRADA.hora} (Brasília), ${VIRADA.local}; prêmio estimado em ${VIRADA.premioTexto}; aposta simples R$ 6,00; não acumula (sem sena, vai para a quina).
- [Todos os resultados](${u}/mega-da-virada/resultados/)
- [Estatísticas](${u}/mega-da-virada/estatisticas/)
- [Calculadora de bolão](${u}/mega-da-virada/calculadora-de-bolao/)
- [Simulador de chances](${u}/mega-da-virada/simulador/)
- [Quanto custa apostar (6 a 20 números)](${u}/mega-da-virada/quanto-custa-apostar/) · [Prêmios por acertos](${u}/mega-da-virada/premios-por-acertos/) · [Como jogar online](${u}/mega-da-virada/como-jogar-online/) · [O que comprar se ganhar](${u}/mega-da-virada/o-que-comprar/) · [Palpites por signo](${u}/mega-da-virada/palpites-por-signo/)
- [Seus números da sorte](${u}/mega-da-virada/seus-numeros/) · [Bolão online com conferência automática](${u}/mega-da-virada/bolao-online/) · [Quanto rende R$ 1 bilhão](${u}/mega-da-virada/quanto-rende/)

## Dezenas e prêmios
- Página de cada dezena: ${u}/{loteria}/dezenas/{NN}/ (quantas vezes saiu, última vez, atraso, companheiras) · índice: ${u}/{loteria}/dezenas/
- Quanto paga cada faixa: ${u}/{loteria}/premios/
- Conferir jogos: ${u}/{loteria}/conferir/ · Gerador: ${u}/{loteria}/gerador/ · Preço e chances por quantidade de números: ${u}/{loteria}/com-{N}-numeros/
- Concursos especiais: ${u}/lotofacil-da-independencia/ · ${u}/quina-de-sao-joao/ · ${u}/dupla-de-pascoa/

## Estatísticas
${LOTERIAS.filter((l) => l.tipo !== 'colunas').map((l) => `- [Estatísticas da ${l.nome}](${u}/${l.slug}/estatisticas/): dezenas mais sorteadas, atrasadas e frequência`).join('\n')}

## Guias
${GUIAS.map((g) => `- [${g.titulo}](${u}/guias/${g.slug}/): ${g.desc}`).join('\n')}

## Sobre
- [Metodologia e fontes](${u}/metodologia/)
- [Sobre nós](${u}/sobre/)
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
