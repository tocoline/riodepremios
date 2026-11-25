// Worker coletor do Rio de Prêmios — arquivo único para colar no editor do Cloudflare (gerado de workers/coletor/src)
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../src/lib/loterias.ts
var LOTERIAS = [
  {
    slug: "mega-sena",
    api: "megasena",
    nome: "Mega-Sena",
    curto: "Mega",
    cor: "#1fa774",
    cor2: "#0b6b47",
    tipo: "padrao",
    min: 1,
    max: 60,
    sorteadas: 6,
    escolhaMin: 6,
    escolhaMax: 20,
    preco: 6,
    dias: [2, 4, 6],
    resumo: "A loteria mais famosa do Brasil: escolha de 6 a 20 n\xFAmeros entre 1 e 60 e ganhe acertando 4, 5 ou 6 dezenas.",
    faixas: [{ acertos: 6, label: "Sena (6 acertos)" }, { acertos: 5, label: "Quina (5 acertos)" }, { acertos: 4, label: "Quadra (4 acertos)" }],
    dicas: ["Cada dezena a mais multiplica o custo \u2014 7 n\xFAmeros custam 7 apostas simples.", "O concurso especial de fim de ano \xE9 a Mega da Virada, que n\xE3o acumula."]
  },
  {
    slug: "lotofacil",
    api: "lotofacil",
    nome: "Lotof\xE1cil",
    curto: "Lotof\xE1cil",
    cor: "#b4239c",
    cor2: "#6e0f60",
    tipo: "padrao",
    min: 1,
    max: 25,
    sorteadas: 15,
    escolhaMin: 15,
    escolhaMax: 20,
    preco: 3.5,
    dias: [1, 2, 3, 4, 5, 6],
    resumo: "A loteria com a maior chance de pr\xEAmio: marque de 15 a 20 n\xFAmeros entre 25 e ganhe a partir de 11 acertos.",
    faixas: [15, 14, 13, 12, 11].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ["As faixas de 11, 12 e 13 acertos t\xEAm pr\xEAmios fixos.", "A Lotof\xE1cil da Independ\xEAncia \xE9 o concurso especial de setembro."]
  },
  {
    slug: "quina",
    api: "quina",
    nome: "Quina",
    curto: "Quina",
    cor: "#4b3fd1",
    cor2: "#22197a",
    tipo: "padrao",
    min: 1,
    max: 80,
    sorteadas: 5,
    escolhaMin: 5,
    escolhaMax: 15,
    preco: 3,
    dias: [1, 2, 3, 4, 5, 6],
    resumo: "Sorteios de segunda a s\xE1bado: escolha de 5 a 15 n\xFAmeros entre 1 e 80 e ganhe com 2, 3, 4 ou 5 acertos.",
    faixas: [{ acertos: 5, label: "Quina (5)" }, { acertos: 4, label: "Quadra (4)" }, { acertos: 3, label: "Terno (3)" }, { acertos: 2, label: "Duque (2)" }],
    dicas: ["A Quina de S\xE3o Jo\xE3o \xE9 o concurso especial de junho."]
  },
  {
    slug: "lotomania",
    api: "lotomania",
    nome: "Lotomania",
    curto: "Lotomania",
    cor: "#f28c1b",
    cor2: "#a3520a",
    tipo: "fixo",
    min: 0,
    max: 99,
    sorteadas: 20,
    escolhaMin: 50,
    escolhaMax: 50,
    preco: 3,
    dias: [1, 3, 5],
    resumo: "Marque 50 n\xFAmeros entre 00 e 99. S\xE3o sorteadas 20 dezenas e voc\xEA ganha com 20, 19, 18, 17, 16, 15 ou nenhum acerto.",
    faixas: [20, 19, 18, 17, 16, 15, 0].map((a) => ({ acertos: a, label: a === 0 ? "Nenhum acerto" : `${a} acertos` })),
    dicas: ["Errar todas as 20 dezenas tamb\xE9m d\xE1 pr\xEAmio.", 'A "aposta espelho" marca os 50 n\xFAmeros que voc\xEA deixou de fora.']
  },
  {
    slug: "timemania",
    api: "timemania",
    nome: "Timemania",
    curto: "Timemania",
    cor: "#16a34a",
    cor2: "#a3a30b",
    tipo: "fixo",
    min: 1,
    max: 80,
    sorteadas: 7,
    escolhaMin: 10,
    escolhaMax: 10,
    preco: 3.5,
    dias: [2, 4, 6],
    extra: "Time do Cora\xE7\xE3o",
    resumo: "Escolha 10 n\xFAmeros entre 1 e 80 e um Time do Cora\xE7\xE3o. S\xE3o sorteadas 7 dezenas e um time.",
    faixas: [7, 6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ["Acertar o Time do Cora\xE7\xE3o garante um pr\xEAmio fixo.", "Parte da arrecada\xE7\xE3o vai para os clubes de futebol participantes."]
  },
  {
    slug: "dupla-sena",
    api: "duplasena",
    nome: "Dupla Sena",
    curto: "Dupla",
    cor: "#c0263a",
    cor2: "#6e0e1b",
    tipo: "padrao",
    min: 1,
    max: 50,
    sorteadas: 6,
    escolhaMin: 6,
    escolhaMax: 15,
    preco: 3,
    dias: [1, 3, 5],
    resumo: "Dois sorteios por concurso com o mesmo bilhete: escolha de 6 a 15 n\xFAmeros entre 1 e 50.",
    faixas: [6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ["Voc\xEA concorre no 1\xBA e no 2\xBA sorteio com a mesma aposta.", "A Dupla de P\xE1scoa \xE9 o concurso especial do ano."]
  },
  {
    slug: "dia-de-sorte",
    api: "diadesorte",
    nome: "Dia de Sorte",
    curto: "Dia de Sorte",
    cor: "#d4952c",
    cor2: "#8a5410",
    tipo: "padrao",
    min: 1,
    max: 31,
    sorteadas: 7,
    escolhaMin: 7,
    escolhaMax: 15,
    preco: 2.5,
    dias: [2, 4, 6],
    extra: "M\xEAs da Sorte",
    resumo: "Escolha de 7 a 15 n\xFAmeros entre 1 e 31 e um M\xEAs da Sorte. Pr\xEAmios para 4 a 7 acertos.",
    faixas: [7, 6, 5, 4].map((a) => ({ acertos: a, label: `${a} acertos` })),
    dicas: ["Acertar o M\xEAs da Sorte tamb\xE9m paga pr\xEAmio fixo."]
  },
  {
    slug: "super-sete",
    api: "supersete",
    nome: "Super Sete",
    curto: "Super Sete",
    cor: "#8cc63f",
    cor2: "#4a7a12",
    tipo: "colunas",
    min: 0,
    max: 9,
    sorteadas: 7,
    escolhaMin: 7,
    escolhaMax: 21,
    preco: 3,
    dias: [1, 3, 5],
    resumo: "Sete colunas com n\xFAmeros de 0 a 9: escolha um n\xFAmero por coluna (at\xE9 3) e ganhe acertando de 3 a 7 colunas.",
    faixas: [7, 6, 5, 4, 3].map((a) => ({ acertos: a, label: `${a} colunas` })),
    dicas: ["O acerto conta por coluna, n\xE3o pela ordem dos n\xFAmeros."]
  },
  {
    slug: "mais-milionaria",
    api: "maismilionaria",
    nome: "+Milion\xE1ria",
    curto: "+Milion\xE1ria",
    cor: "#3b3fb8",
    cor2: "#c9a227",
    tipo: "trevos",
    min: 1,
    max: 50,
    sorteadas: 6,
    escolhaMin: 6,
    escolhaMax: 12,
    preco: 6,
    dias: [3, 6],
    extra: "Trevos",
    resumo: "Escolha de 6 a 12 n\xFAmeros entre 1 e 50 e de 2 a 6 trevos entre 1 e 6. S\xE3o 10 faixas de premia\xE7\xE3o.",
    faixas: [
      { acertos: 6, trevos: 2, label: "6 + 2 trevos" },
      { acertos: 6, trevos: 1, label: "6 + 1 ou 0 trevo" },
      { acertos: 5, trevos: 2, label: "5 + 2 trevos" },
      { acertos: 5, trevos: 1, label: "5 + 1 ou 0 trevo" },
      { acertos: 4, trevos: 2, label: "4 + 2 trevos" },
      { acertos: 4, trevos: 1, label: "4 + 1 ou 0 trevo" },
      { acertos: 3, trevos: 2, label: "3 + 2 trevos" },
      { acertos: 3, trevos: 1, label: "3 + 1 trevo" },
      { acertos: 2, trevos: 2, label: "2 + 2 trevos" },
      { acertos: 2, trevos: 1, label: "2 + 1 trevo" }
    ],
    dicas: ["O pr\xEAmio principal s\xF3 sai com 6 n\xFAmeros e os 2 trevos.", "\xC9 a loteria com o pr\xEAmio m\xEDnimo garantido mais alto."]
  }
];
var POR_SLUG = Object.fromEntries(LOTERIAS.map((l) => [l.slug, l]));
var POR_API = Object.fromEntries(LOTERIAS.map((l) => [l.api, l]));
var VIRADA = {
  ano: 2026,
  concurso: 3100,
  data: "2027-01-01T11:00:00-03:00",
  dataCurta: "01/01/2027",
  dataTexto: "1\xBA de janeiro de 2027",
  hora: "11h",
  local: "Espa\xE7o da Sorte, em S\xE3o Paulo (SP)",
  premioTexto: "mais de R$ 1 bilh\xE3o",
  premioValor: 1e9,
  prazos: [
    { quando: "Desde 3 de novembro de 2026", o: "Apostas abertas" },
    { quando: "At\xE9 15 de dezembro de 2026", o: "Vendas paralelas (junto com os concursos regulares)" },
    { quando: "16 a 31 de dezembro de 2026, at\xE9 22h", o: "Vendas exclusivas para a Mega da Virada (apostas individuais)" },
    { quando: "At\xE9 9h de 1\xBA de janeiro de 2027", o: "Bol\xF5es digitais nos canais da Caixa" },
    { quando: "1\xBA de janeiro de 2027, 11h", o: "Sorteio, no Espa\xE7o da Sorte (SP)" }
  ],
  fontes: [
    { nome: "Ag\xEAncia Brasil", url: "https://agenciabrasil.ebc.com.br/economia/noticia/2026-11/mega-da-virada-caixa-anuncia-que-premio-deve-superar-r-1-bilhao" },
    { nome: "MT Hoje", url: "https://www.mthoje.com.br/economia/id-732565/mega_da_virada_2026_bate_recorde__veja_quanto_custa_apostar_e_quando_e_o_sorteio" }
  ]
};

// ../../src/lib/normalizar.ts
var isoDe = /* @__PURE__ */ __name((br) => {
  if (!br) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(br);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}, "isoDe");
var nums = /* @__PURE__ */ __name((a) => Array.isArray(a) && a.length ? a.map((x) => parseInt(String(x), 10)).filter((x) => !Number.isNaN(x)) : null, "nums");
var n = /* @__PURE__ */ __name((v) => v == null || v === "" ? null : Number(v), "n");
function normalizar(api, j, fonte) {
  if (!j || typeof j !== "object") return null;
  const numero = n(j.numero ?? j.concurso);
  const data = isoDe(j.dataApuracao ?? j.data);
  const dezenasBrutas = nums(j.listaDezenas ?? j.dezenas);
  if (!numero || !data || !dezenasBrutas) return null;
  const colunas = api === "supersete";
  const dezenas = colunas ? dezenasBrutas : [...dezenasBrutas].sort((a, b) => a - b);
  const ordem = nums(j.dezenasSorteadasOrdemSorteio ?? j.dezenasOrdemSorteio);
  const extra = {};
  const timeMes = j.nomeTimeCoracaoMesSorte ?? j.timeCoracao ?? j.mesSorte;
  if (timeMes && String(timeMes).trim()) {
    if (api === "diadesorte") extra.mes = String(j.mesSorte ?? timeMes).trim();
    else if (api === "timemania") extra.time = String(j.timeCoracao ?? timeMes).trim();
  }
  const trevos = nums(j.trevosSorteados ?? j.trevos);
  if (trevos) extra.trevos = trevos;
  const rateio = j.listaRateioPremio ?? j.premiacoes ?? [];
  const premiacoes = rateio.map((r) => ({
    faixa: Number(r.faixa ?? 0),
    descricao: String(r.descricaoFaixa ?? r.descricao ?? ""),
    ganhadores: Number(r.numeroDeGanhadores ?? r.ganhadores ?? 0),
    premio: Number(r.valorPremio ?? 0)
  }));
  const cidadesBrutas = j.listaMunicipioUFGanhadores ?? j.localGanhadores ?? [];
  const cidades = cidadesBrutas.map((c) => ({
    cidade: String(c.municipio ?? c.nomeMunicipio ?? "").trim(),
    uf: String(c.uf ?? "").trim(),
    ganhadores: Number(c.ganhadores ?? 1)
  })).filter((c) => c.cidade || c.uf);
  const local = [j.localSorteio ?? j.local, j.nomeMunicipioUFSorteio].filter(Boolean).join(" \u2014 ") || null;
  const especial = api === "megasena" && (data.endsWith("-12-31") || numero === VIRADA.concurso) || Number(j.indicadorConcursoEspecial) === 2;
  return {
    loteria: api,
    numero,
    data,
    dezenas,
    dezenas_ordem: ordem,
    dezenas2: nums(j.listaDezenasSegundoSorteio),
    extra: Object.keys(extra).length ? extra : null,
    premiacoes,
    acumulado: Boolean(j.acumulado ?? j.acumulou),
    arrecadacao: n(j.valorArrecadado),
    proximo_numero: n(j.numeroConcursoProximo ?? j.proximoConcurso),
    proximo_data: isoDe(j.dataProximoConcurso),
    proximo_estimativa: n(j.valorEstimadoProximoConcurso),
    acumulado_especial: n(j.valorAcumuladoConcursoEspecial),
    local,
    cidades_ganhadoras: cidades.length ? cidades : null,
    especial,
    fonte
  };
}
__name(normalizar, "normalizar");

// src/index.ts
var ORIGENS = [
  { nome: "caixa", url: /* @__PURE__ */ __name((api, n2) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}${n2 ? "/" + n2 : ""}`, "url") },
  { nome: "reserva", url: /* @__PURE__ */ __name((api, n2) => `https://loteriascaixa-api.herokuapp.com/api/${api}/${n2 ?? "latest"}`, "url") },
  { nome: "reserva2", url: /* @__PURE__ */ __name((api, n2) => `https://api.guidi.dev.br/loteria/${api}/${n2 ?? "ultimo"}`, "url") }
];
var HEADERS = { accept: "application/json", "user-agent": "Mozilla/5.0 (compatible; RioDePremiosBot/1.0)" };
var LIMITE_SUBREQ = 45;
var usados = 0;
async function buscar(api, n2) {
  for (const o of ORIGENS) {
    if (usados >= LIMITE_SUBREQ) return null;
    usados++;
    try {
      const r = await fetch(o.url(api, n2), {
        headers: HEADERS,
        cf: { cacheTtl: 0 }
      });
      if (!r.ok) continue;
      const row = normalizar(api, await r.json(), o.nome);
      if (row && (!n2 || row.numero === n2)) return row;
    } catch (e) {
      console.warn(o.nome, api, n2, String(e));
    }
  }
  return null;
}
__name(buscar, "buscar");
var SQL = `INSERT INTO concursos (loteria, numero, data, dezenas, dezenas_ordem, dezenas2, extra, premiacoes, acumulado, arrecadacao,
  proximo_numero, proximo_data, proximo_estimativa, acumulado_especial, local, cidades_ganhadoras, especial, fonte, atualizado_em)
  VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)
  ON CONFLICT(loteria, numero) DO UPDATE SET data=excluded.data, dezenas=excluded.dezenas, dezenas_ordem=excluded.dezenas_ordem,
  dezenas2=excluded.dezenas2, extra=excluded.extra, premiacoes=excluded.premiacoes, acumulado=excluded.acumulado,
  arrecadacao=excluded.arrecadacao, proximo_numero=excluded.proximo_numero, proximo_data=excluded.proximo_data,
  proximo_estimativa=excluded.proximo_estimativa, acumulado_especial=excluded.acumulado_especial, local=excluded.local,
  cidades_ganhadoras=excluded.cidades_ganhadoras, especial=excluded.especial, fonte=excluded.fonte, atualizado_em=excluded.atualizado_em`;
var js = /* @__PURE__ */ __name((v) => v == null ? null : JSON.stringify(v), "js");
function stmt(db, c) {
  return db.prepare(SQL).bind(
    c.loteria,
    c.numero,
    c.data,
    js(c.dezenas),
    js(c.dezenas_ordem),
    js(c.dezenas2),
    js(c.extra),
    js(c.premiacoes),
    c.acumulado ? 1 : 0,
    c.arrecadacao,
    c.proximo_numero,
    c.proximo_data,
    c.proximo_estimativa,
    c.acumulado_especial,
    c.local,
    js(c.cidades_ganhadoras),
    c.especial ? 1 : 0,
    c.fonte,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(stmt, "stmt");
async function gravar(env, c) {
  await stmt(env.DB, c).run();
}
__name(gravar, "gravar");
async function registrar(env, msg) {
  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS coletor_log (quando TEXT, mensagem TEXT)").run();
    await env.DB.prepare("INSERT INTO coletor_log VALUES (?1, ?2)").bind((/* @__PURE__ */ new Date()).toISOString(), msg.slice(0, 2e3)).run();
    await env.DB.prepare("DELETE FROM coletor_log WHERE rowid NOT IN (SELECT rowid FROM coletor_log ORDER BY quando DESC LIMIT 50)").run();
  } catch (e) {
    console.error("log", String(e));
  }
}
__name(registrar, "registrar");
async function executar(env, historicoMax = 30) {
  usados = 0;
  const log = {};
  const ultimos = {};
  const erros = [];
  for (const l of LOTERIAS) {
    try {
      const c = await buscar(l.api);
      if (c) {
        await gravar(env, c);
        ultimos[l.api] = c.numero;
      } else erros.push(`${l.api}: nenhuma fonte respondeu`);
    } catch (e) {
      erros.push(`${l.api}: ${String(e)}`);
    }
  }
  log.ultimos = ultimos;
  let gravados = 0;
  try {
    const { results } = await env.DB.prepare("SELECT loteria, numero FROM concursos").all();
    const tem = new Set(results.map((r) => r.loteria + ":" + r.numero));
    const porLoteria = [];
    for (const [api, topo] of Object.entries(ultimos)) {
      const f = [];
      for (let n2 = topo; n2 >= 1 && f.length < 6; n2--) if (!tem.has(api + ":" + n2)) f.push([api, n2]);
      porLoteria.push(f);
    }
    const faltando = [];
    for (let i = 0; i < 6; i++) for (const f of porLoteria) if (f[i]) faltando.push(f[i]);
    for (const [api, n2] of faltando.slice(0, historicoMax)) {
      if (usados >= LIMITE_SUBREQ) break;
      const c = await buscar(api, n2);
      if (c) {
        await gravar(env, c);
        gravados++;
      }
    }
  } catch (e) {
    erros.push("historico: " + String(e));
  }
  log.historico = gravados;
  log.requisicoes = usados;
  if (erros.length) log.erros = erros;
  await registrar(env, JSON.stringify(log));
  return log;
}
__name(executar, "executar");
var index_default = {
  async scheduled(_e, env, ctx) {
    ctx.waitUntil(executar(env).catch((e) => registrar(env, "falha: " + String(e))));
  },
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/status") {
      const { results } = await env.DB.prepare("SELECT loteria, COUNT(*) total, MAX(numero) ultimo, MAX(atualizado_em) atualizado FROM concursos GROUP BY loteria").all();
      let execucoes = [];
      try {
        execucoes = (await env.DB.prepare("SELECT * FROM coletor_log ORDER BY quando DESC LIMIT 10").all()).results;
      } catch {
      }
      return Response.json({ loterias: results, execucoes });
    }
    if (url.pathname === "/diag") {
      const out = [];
      for (const o of ORIGENS) {
        const u = o.url("megasena");
        try {
          const r = await fetch(u, { headers: HEADERS, cf: { cacheTtl: 0 } });
          const txt = await r.text();
          let ok = false;
          try {
            ok = !!normalizar("megasena", JSON.parse(txt), o.nome);
          } catch {
          }
          out.push({ fonte: o.nome, url: u, status: r.status, interpretou: ok, inicio: txt.slice(0, 300) });
        } catch (e) {
          out.push({ fonte: o.nome, url: u, erro: String(e) });
        }
      }
      return Response.json(out);
    }
    if (url.pathname === "/teste") {
      usados = 0;
      try {
        const c = await buscar("megasena");
        if (!c) return Response.json({ ok: false, erro: "nenhuma fonte respondeu" });
        await gravar(env, c);
        return Response.json({ ok: true, gravado: { numero: c.numero, data: c.data, dezenas: c.dezenas, fonte: c.fonte } });
      } catch (e) {
        return Response.json({ ok: false, erro: String(e) }, { status: 500 });
      }
    }
    if (url.pathname === "/run") {
      if (!env.RUN_TOKEN || url.searchParams.get("token") !== env.RUN_TOKEN) return new Response("n\xE3o autorizado", { status: 401 });
      return Response.json(await executar(env, Number(url.searchParams.get("historico")) || 30));
    }
    return new Response("Rio de Pr\xEAmios \u2014 coletor de resultados", { status: 200 });
  }
};
export {
  index_default as default
};
