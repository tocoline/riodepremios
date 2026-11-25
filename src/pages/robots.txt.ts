import type { APIRoute } from 'astro';
export const GET: APIRoute = () => new Response(`User-agent: *
Allow: /
Disallow: /api/

# Robôs de IA são bem-vindos (GEO)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://www.riodepremios.com.br/sitemap-index.xml
Sitemap: https://www.riodepremios.com.br/sitemap-concursos.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
