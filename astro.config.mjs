import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Sitemaps são gerados pelo próprio site (src/pages/sitemap-*.xml.ts), com lastmod real.
export default defineConfig({
  site: 'https://www.riodepremios.com.br',
  output: 'static',
  trailingSlash: 'ignore', // a barra final é garantida pelo middleware (depois das regras do site antigo)
  adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'passthrough' }),
  build: { inlineStylesheets: 'auto' },
});
