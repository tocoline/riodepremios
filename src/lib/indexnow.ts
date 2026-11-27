// IndexNow: avisa Bing, Yandex, Seznam e Naver (e, via Bing, ChatGPT Search, Copilot e DuckDuckGo)
// assim que um resultado novo entra no banco. Roda em segundo plano no middleware, no máximo a cada 5 min por isolate.
// Custo: 9 leituras de 1 linha (MAX por loteria, pelo índice da chave primária) por checagem.
import { LOTERIAS, POR_API } from './loterias';
import { SITE } from './site';
import { paginas } from './sitemap';

export const INDEXNOW_KEY = '3802c2adaaaba15caa3569bef3432fd3';
const INTERVALO = 5 * 60e3;
let ultimaChecagem = 0;

async function enviar(db: any, urls: string[]) {
  const host = new URL(SITE.url).host;
  for (let i = 0; i < urls.length; i += 10000) {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
    });
    console.log('indexnow', r.status, urls.length);
    // registro do último envio (status HTTP e quantidade), consultável em /api/indexnow.json
    await db.prepare("INSERT INTO indexnow (loteria, numero, em) VALUES ('_envio', ?1, ?2) ON CONFLICT(loteria) DO UPDATE SET numero=excluded.numero, em=excluded.em").bind(r.status * 100000 + Math.min(urls.length, 99999), new Date().toISOString()).run().catch(() => {});
  }
}

export async function indexnow(db: any, host: string) {
  if (!db || host !== new URL(SITE.url).host || Date.now() - ultimaChecagem < INTERVALO) return;
  ultimaChecagem = Date.now();
  try {
    await db.prepare('CREATE TABLE IF NOT EXISTS indexnow (loteria TEXT PRIMARY KEY, numero INTEGER NOT NULL, em TEXT NOT NULL)').run();
    const atuais = await db.batch(LOTERIAS.map((l) => db.prepare('SELECT loteria, numero, data FROM concursos WHERE loteria=? ORDER BY numero DESC LIMIT 1').bind(l.api)));
    const vistos = new Map<string, number>((((await db.prepare("SELECT loteria, numero FROM indexnow WHERE loteria <> '_envio'").all()).results ?? []) as any[]).map((r) => [r.loteria, r.numero]));
    const primeiraVez = vistos.size === 0;
    const urls = new Set<string>();
    const agora = new Date().toISOString();
    for (const res of atuais) {
      const c = (res.results ?? [])[0]; const l = c && POR_API[c.loteria];
      if (!l || (vistos.get(c.loteria) ?? 0) >= c.numero) continue;
      // "reserva" o aviso: só o isolate que gravar a linha envia (evita duplicatas)
      const up = await db.prepare('INSERT INTO indexnow (loteria, numero, em) VALUES (?1, ?2, ?3) ON CONFLICT(loteria) DO UPDATE SET numero=excluded.numero, em=excluded.em WHERE excluded.numero > indexnow.numero').bind(c.loteria, c.numero, agora).run();
      if (!up.meta?.changes || primeiraVez) continue;
      const u = SITE.url;
      for (const p of [`/${l.slug}/concurso/${c.numero}/`, `/${l.slug}/concurso/${c.numero + 1}/`, `/${l.slug}/`, `/${l.slug}/resultados/`, `/${l.slug}/resultados/${c.data.slice(0, 4)}/`, `/${l.slug}/premios/`])
        urls.add(u + p);
      if (l.tipo !== 'colunas') for (const p of ['estatisticas/', 'numeros-que-mais-saem/', 'numeros-atrasados/']) urls.add(`${u}/${l.slug}/${p}`);
    }
    if (urls.size) { urls.add(SITE.url + '/'); await enviar(db, [...urls]); }
    // primeira execução: envia uma vez todas as páginas (sem os concursos) para acelerar a descoberta
    if (primeiraVez) await enviar(db, (await paginas(db)).map((x) => SITE.url + x.loc));
  } catch (e) { console.error('indexnow', String(e)); }
}
