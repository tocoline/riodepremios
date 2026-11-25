# Prompt para a extensão Claude no Chrome (parte 2 de 2): publicar o site

---

Estou no painel do Cloudflare. Publique o site do repositório GitHub tocoline/riodepremios no Cloudflare Pages:

1. Vá em Workers & Pages → Create → aba Pages → "Import an existing Git repository" (Connect to Git).
   Se pedir, autorize o GitHub e dê acesso ao repositório tocoline/riodepremios.
2. Escolha o repositório tocoline/riodepremios, branch "main".
3. Nome do projeto: riodepremios. Framework preset: Astro.
   Build command: npm run build — Build output directory: dist
4. Clique em "Save and Deploy" e espere o build terminar. Se der erro, copie as últimas linhas do log de build e me mostre.
5. Quando terminar, me diga o endereço *.pages.dev do site e confirme em Settings → Bindings que existe o binding D1 "DB" → riodepremios (ele vem do arquivo wrangler.toml).
6. Abra o endereço do site, a página /mega-sena/ e a página /mega-da-virada/, e me diga se aparecem resultados ou a mensagem "Aguardando primeira sincronização".

Não mexa em DNS nem em domínio personalizado por enquanto.
