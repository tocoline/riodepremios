import type { APIRoute } from 'astro';
import { LOTERIAS, diasTexto, VIRADA } from '../lib/loterias';
import { chancePrincipal } from '../lib/conteudo';
import { GUIAS } from '../lib/guias';
import { SITE } from '../lib/site';
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

## Mega da Virada ${VIRADA.ano}
- [Guia completo](${u}/mega-da-virada/): sorteio em 31/12/${VIRADA.ano} às 20h (Brasília); prêmio não acumula (sem sena, vai para a quina).
- [Todos os resultados](${u}/mega-da-virada/resultados/)
- [Estatísticas](${u}/mega-da-virada/estatisticas/)
- [Calculadora de bolão](${u}/mega-da-virada/calculadora-de-bolao/)
- [Simulador de chances](${u}/mega-da-virada/simulador/)

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
