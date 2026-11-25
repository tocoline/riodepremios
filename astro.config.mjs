import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.riodepremios.com.br';
const LOTERIAS = ['mega-sena', 'lotofacil', 'quina', 'lotomania', 'timemania', 'dupla-sena', 'dia-de-sorte', 'super-sete', 'mais-milionaria'];
// páginas renderizadas sob demanda (não entram no sitemap automático)
const dinamicas = [
  '/', '/mega-da-virada/', '/mega-da-virada/resultados/', '/mega-da-virada/estatisticas/',
  ...LOTERIAS.flatMap((l) => [`/${l}/`, `/${l}/resultados/`, ...(l === 'super-sete' ? [] : [`/${l}/estatisticas/`])]),
].map((p) => SITE + p);

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'passthrough' }),
  integrations: [sitemap({ customPages: dinamicas, filter: (p) => !p.includes('/api/') && !p.endsWith('/404/') })],
  build: { inlineStylesheets: 'auto' },
});
