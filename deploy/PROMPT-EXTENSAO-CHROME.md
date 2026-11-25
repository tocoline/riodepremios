# Prompt para a extensão Claude no Chrome (parte 1 de 2)

Cole o texto abaixo na extensão, com o painel do Cloudflare aberto.

---

Estou no painel do Cloudflare. Faça estes passos e me informe o resultado de cada um:

1. Vá em **Storage & Databases → D1** e crie um banco chamado **riodepremios** (localização automática).
2. Abra o banco, vá na aba **Console** e execute este SQL inteiro:
   https://github.com/tocoline/riodepremios/blob/main/deploy/banco.sql
   (abra o link, clique em "Raw", copie tudo e cole no console).
3. Me diga o **Database ID** do banco (aparece na página do banco).
4. Vá em **Workers & Pages → Create → Workers → Create Worker** (modelo "Hello World"), nome **riodepremios-coletor**, e clique em Deploy.
5. Clique em **Edit code**, apague todo o código e cole o conteúdo de:
   https://github.com/tocoline/riodepremios/blob/main/deploy/coletor.js (abra em "Raw" e copie tudo). Clique em **Deploy**.
6. No Worker, vá em **Settings → Bindings → Add → D1 database**: nome da variável **DB**, banco **riodepremios**. Salve.
7. Em **Settings → Variables and Secrets → Add**: tipo **Secret**, nome **RUN_TOKEN**, valor: uma senha qualquer que você inventar (me diga qual foi). Salve.
8. Em **Settings → Trigger Events → Add → Cron Triggers**: expressão `*/10 * * * *`. Salve.
9. Abra no navegador `https://riodepremios-coletor.<subdominio>.workers.dev/run?token=<RUN_TOKEN>` (o endereço aparece na página do Worker) e me mostre o que apareceu. Depois abra `/status` no mesmo endereço e me mostre também.
