# Rio de Prêmios

Site de resultados de loterias 100% no Cloudflare (sem custo de hospedagem):

| Parte | Serviço | Pasta |
|---|---|---|
| Site (Astro) | Cloudflare **Pages** + Pages Functions | `src/` |
| Banco de resultados | Cloudflare **D1** | `migrations/` |
| Coleta automática (a cada 10 min) | Cloudflare **Worker** com Cron Trigger | `workers/coletor/` |

## Situação atual (produção)

- Site: https://riodepremios.pages.dev (deploy automático a cada push na `main`)
- Coletor: https://riodepremios-coletor.evandroline.workers.dev — `/status` (banco e últimas execuções), `/diag` (fontes), `/teste`
- Banco D1 `riodepremios` (id `6d6262fc-bbe1-4fa2-91a7-bda343cc1070`)
- O Worker coletor foi publicado colando `deploy/coletor.js` no editor do Cloudflare. Ao mudar `workers/coletor/src`,
  gere o arquivo de novo (`npx wrangler deploy -c workers/coletor/wrangler.toml --dry-run --outdir /tmp/wk`) ou publique com `npm run coletor:deploy`.

## Como funciona

1. O Worker `riodepremios-coletor` roda a cada 10 minutos, busca o último concurso de cada loteria na API pública da Caixa
   (com uma API comunitária de reserva) e grava no D1.
2. Na mesma execução ele completa o histórico aos poucos (≈35 concursos por execução → histórico inteiro em poucos dias).
3. As páginas de resultado leem o D1 na hora; as páginas de conteúdo (guias, ferramentas) são estáticas.

## Publicação (passo a passo)

Pré-requisitos: conta gratuita no Cloudflare e Node 20+.

```bash
npm install
npx wrangler login
```

1. **Criar o banco**

   ```bash
   npx wrangler d1 create riodepremios
   ```

   Copie o `database_id` mostrado e cole em **`wrangler.toml`** e em **`workers/coletor/wrangler.toml`**.

2. **Criar as tabelas**

   ```bash
   npm run db:migrate:remote
   ```

3. **Publicar o coletor** e definir um token para o disparo manual

   ```bash
   npm run coletor:deploy
   npx wrangler secret put RUN_TOKEN -c workers/coletor/wrangler.toml
   ```

   Teste: abra `https://riodepremios-coletor.<sua-conta>.workers.dev/run?token=SEU_TOKEN` e depois `/status`.

4. **Publicar o site no Pages** — conecte o repositório do GitHub em *Workers & Pages → Create → Pages*:
   - Build command: `npm run build` · Output: `dist`
   - *Settings → Bindings*: adicione **D1** com nome `DB` → banco `riodepremios`
   - *Settings → Variables*: `PUBLIC_ADSENSE_CLIENT` (ex.: `ca-pub-123…`) e `PUBLIC_ADSENSE_SLOT` (quando o AdSense aprovar)

   (Alternativa sem GitHub: `npm run deploy`.)

5. **Domínio** — adicione `riodepremios.com.br` ao Cloudflare (troque os DNS no Registro.br) e, no projeto Pages,
   em *Custom domains*, adicione `www.riodepremios.com.br`. Crie um redirecionamento de `riodepremios.com.br` → `www`.

6. **Cache (recomendado)** — em *Caching → Cache Rules*, crie uma regra "Eligible for cache" para o hostname
   `www.riodepremios.com.br` respeitando o `Cache-Control` da origem. Isso reduz chamadas às Functions.

7. **Google Search Console** — envie `/sitemap-index.xml` e `/sitemap-concursos.xml`.

## Limites do plano gratuito

- Páginas estáticas: ilimitadas.
- Pages Functions (páginas de resultado, API): 100 mil requisições/dia somando Workers. Com a regra de cache do passo 6
  isso cobre bastante tráfego; se passar disso, o plano Workers Paid custa US$ 5/mês.
- D1: 5 GB e 5 milhões de leituras/dia (o histórico completo ocupa poucos MB).
- Worker coletor: ~144 execuções/dia, bem abaixo do limite.

## AdSense

- Os anúncios só aparecem quando `PUBLIC_ADSENSE_CLIENT` e `PUBLIC_ADSENSE_SLOT` estão definidos (em desenvolvimento aparece um espaço reservado).
- `/ads.txt` é gerado automaticamente a partir de `PUBLIC_ADSENSE_CLIENT`.
- Ative a mensagem de consentimento do Google (AdSense → *Privacidade e mensagens*) para LGPD/GDPR.
- Os espaços de anúncio têm altura reservada para não prejudicar o Core Web Vitals (CLS).

## SEO, GEO e E-E-A-T

- Schema.org em todas as páginas (Organization, WebSite, BreadcrumbList, FAQPage, HowTo, Event, Article, WebApplication).
- Bloco "Resposta rápida" no topo das páginas (respostas diretas para Google e IAs).
- `/llms.txt`, robots liberando robôs de IA, API JSON pública (`/api/ultimos.json`, `/api/resultado.json?loteria=mega-sena&concurso=ultimo`).
- Páginas de autoria, metodologia, jogo responsável, privacidade e termos.
- **Preencha o responsável editorial real** em `src/lib/site.ts` (`editor`) — nome, bio e links fortalecem o E-E-A-T.

## Desenvolvimento local

```bash
npm run db:migrate:local
npm run build && npm run preview   # http://localhost:8788
```

## Onde editar

- Loterias, preços, dias de sorteio: `src/lib/loterias.ts`
- Data da Mega da Virada: `VIRADA` em `src/lib/loterias.ts`
- Novos guias: `src/lib/guias.ts`
- Cores e visual: `src/styles/global.css`
