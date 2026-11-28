// Gera os fechamentos (coberturas) da Lotofácil e da Mega-Sena e grava em public/fechamentos/<loteria>.json.
// Uso: node scripts/gerar-fechamentos.mjs [lotofacil|mega-sena]
//
// Problema: escolher jogos de k números dentro das v dezenas do apostador de modo que, para TODO conjunto
// de m sorteadas que caia dentro das v, algum jogo tenha pelo menos t acertos (L(v,k,m,t)).
// Método: guloso (exato com buckets quando a vizinhança é pequena; amostrado quando é grande), vários
// reinícios, remoção de jogos redundantes e VERIFICAÇÃO EXAUSTIVA da garantia. Também calcula, de forma
// exata, a chance de cada faixa num sorteio qualquer (sem a condição).
import { writeFileSync, mkdirSync } from 'node:fs';

const CONFIG = {
  lotofacil: { universo: 25, sorteadas: 15, k: 15, faixas: [11, 12, 13, 14, 15],
    combos: [16, 17, 18, 19, 20, 21].flatMap((v) => [14, 13, 12, 11].map((t) => ({ v, m: 15, t }))) },
  'mega-sena': { universo: 60, sorteadas: 6, k: 6, faixas: [4, 5, 6],
    combos: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].flatMap((v) => [[6, 5], [6, 4], [5, 4], [4, 4]].map(([m, t]) => ({ v, m, t }))) },
};

// ---------- utilitários ----------
const B = Array.from({ length: 64 }, () => new Float64Array(64));
for (let n = 0; n < 64; n++) { B[n][0] = 1; for (let r = 1; r <= n; r++) B[n][r] = B[n - 1][r - 1] + (r <= n - 1 ? B[n - 1][r] : 0); }
const C = (n, r) => (r < 0 || r > n || n < 0 ? 0 : B[n][r]);
const pc = (x) => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; };
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function subsets(v, r) { // todas as máscaras com r bits entre v (ordem colex = Gosper)
  const out = new Int32Array(C(v, r)); if (r === 0) { out[0] = 0; return out; }
  let x = (1 << r) - 1, i = 0; const lim = 1 << v;
  while (x < lim) { out[i++] = x; const c = x & -x, rr = x + c; x = (((rr ^ x) >>> 2) / c) | rr; }
  return out;
}
const rank = (mask) => { let r = 0, i = 0; for (let p = 0; mask; p++, mask >>>= 1) if (mask & 1) r += C(p, ++i); return r; };
const bits = (mask) => { const a = []; for (let p = 0; mask; p++, mask >>>= 1) if (mask & 1) a.push(p); return a; };
function combos(arr, r, cb) { // cb(máscara) para cada r-subconjunto de arr (posições)
  const n = arr.length; if (r > n) return; if (r === 0) { cb(0); return; }
  const idx = Array.from({ length: r }, (_, i) => i);
  for (;;) {
    let m = 0; for (let i = 0; i < r; i++) m |= 1 << arr[idx[i]]; cb(m);
    let i = r - 1; while (i >= 0 && idx[i] === n - r + i) i--; if (i < 0) return;
    idx[i]++; for (let j = i + 1; j < r; j++) idx[j] = idx[j - 1] + 1;
  }
}
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- cobertura ----------
function vizinhanca(v, k, m, t) { let s = 0; for (let j = t; j <= Math.min(m, k); j++) s += C(k, j) * C(v - k, m - j); return s; }

function gulosoExato(v, k, m, t, rnd) {
  const full = (1 << v) - 1, N = C(v, m);
  const cobre = (T, cb) => { const dentro = bits(T), fora = bits(full & ~T); for (let j = t; j <= Math.min(m, k); j++) combos(dentro, j, (a) => combos(fora, m - j, (b) => cb(rank(a | b)))); };
  const coberto = new Uint8Array(N); let falta = N;
  const cand = shuffle(Array.from(subsets(v, k)), rnd);
  const viz = vizinhanca(v, k, m, t);
  const buckets = Array.from({ length: viz + 1 }, () => []); buckets[viz] = cand; let topo = viz;
  const jogos = [];
  while (falta > 0) {
    while (topo > 0 && !buckets[topo].length) topo--;
    const T = buckets[topo].pop();
    let s = 0; cobre(T, (r) => { if (!coberto[r]) s++; });
    if (s === topo) { jogos.push(T); cobre(T, (r) => { if (!coberto[r]) { coberto[r] = 1; falta--; } }); }
    else if (s > 0) buckets[s].push(T);
  }
  return jogos;
}

function gulosoAmostrado(v, k, m, t, rnd, amostra = 1500) {
  const full = (1 << v) - 1;
  let U = Array.from(subsets(v, m));
  const aleatorio = () => { const p = shuffle(Array.from({ length: v }, (_, i) => i), rnd); let x = 0; for (let i = 0; i < k; i++) x |= 1 << p[i]; return x; };
  const completar = (S) => { // jogo que contém o alvo S (m ≤ k)
    const fora = shuffle(bits(full & ~S), rnd); let x = S; for (let i = 0; i < k - m; i++) x |= 1 << fora[i]; return x; };
  const jogos = [];
  while (U.length) {
    let melhor = 0, ms = -1;
    const cands = [];
    for (let i = 0; i < amostra; i++) cands.push(aleatorio());
    for (let i = 0; i < 150; i++) cands.push(completar(U[Math.floor(rnd() * U.length)]));
    for (const T of cands) { let s = 0; for (let i = 0; i < U.length; i++) if (pc(T & U[i]) >= t) s++; if (s > ms) { ms = s; melhor = T; } }
    jogos.push(melhor); U = U.filter((S) => pc(melhor & S) < t);
  }
  return jogos;
}

function podar(v, m, t, jogos, rnd) { // remove jogos redundantes
  const alvos = subsets(v, m), cnt = new Int32Array(alvos.length);
  for (const T of jogos) for (let i = 0; i < alvos.length; i++) if (pc(T & alvos[i]) >= t) cnt[i]++;
  const ordem = shuffle(jogos.slice(), rnd), manter = new Set(jogos);
  for (const T of ordem) {
    let ok = true; for (let i = 0; i < alvos.length && ok; i++) if (pc(T & alvos[i]) >= t && cnt[i] < 2) ok = false;
    if (ok) { manter.delete(T); for (let i = 0; i < alvos.length; i++) if (pc(T & alvos[i]) >= t) cnt[i]--; }
  }
  return jogos.filter((T) => manter.has(T));
}

function verificar(v, m, t, jogos) {
  for (const S of subsets(v, m)) { let ok = false; for (const T of jogos) if (pc(T & S) >= t) { ok = true; break; } if (!ok) return false; }
  return true;
}

function fechar(v, k, m, t) {
  if (t > m || m > v || k > v) return null;
  const viz = vizinhanca(v, k, m, t), N = C(v, m);
  if (viz >= N) return [((1 << k) - 1)]; // um único jogo já garante
  const exato = viz <= 2500;
  const reinicios = exato ? (C(v, k) * viz > 3e7 ? 2 : 6) : 3;
  let melhor = null;
  for (let r = 0; r < reinicios; r++) {
    const rnd = mulberry32(1000 * v + 100 * m + 10 * t + r);
    let j = exato ? gulosoExato(v, k, m, t, rnd) : gulosoAmostrado(v, k, m, t, rnd);
    j = podar(v, m, t, j, rnd);
    if (!melhor || j.length < melhor.length) melhor = j;
  }
  if (!verificar(v, m, t, melhor)) throw new Error(`garantia falhou ${v} ${m} ${t}`);
  return melhor;
}

// chance exata de o melhor jogo fazer pelo menos h acertos num sorteio qualquer
function chances(cfg, v, jogos) {
  const { universo: U, sorteadas: D, k, faixas } = cfg;
  const tot = C(U, D), res = Object.fromEntries(faixas.map((h) => [h, 0]));
  for (let x = Math.max(0, D - (U - v)); x <= Math.min(D, v); x++) {
    const peso = (C(v, x) * C(U - v, D - x)) / tot; if (!peso) continue;
    if (x < faixas[0]) continue;
    const cont = Object.fromEntries(faixas.map((h) => [h, 0]));
    const teto = Math.min(x, k);
    for (const X of subsets(v, x)) {
      let best = 0; for (const T of jogos) { const p = pc(T & X); if (p > best) { best = p; if (best === teto) break; } }
      for (const h of faixas) if (best >= h) cont[h]++;
    }
    for (const h of faixas) res[h] += (peso * cont[h]) / C(v, x);
  }
  return res;
}

const alvoLoteria = process.argv[2];
for (const [slug, cfg] of Object.entries(CONFIG)) {
  if (alvoLoteria && slug !== alvoLoteria) continue;
  const out = { loteria: slug, k: cfg.k, universo: cfg.universo, sorteadas: cfg.sorteadas, geradoEm: new Date().toISOString().slice(0, 10), fechamentos: [] };
  for (const { v, m, t } of cfg.combos) {
    const t0 = Date.now();
    const jogos = fechar(v, cfg.k, m, t);
    if (!jogos) continue;
    jogos.sort((a, b) => a - b);
    const ch = chances(cfg, v, jogos);
    const pCond = (() => { let s = 0; for (let x = m; x <= Math.min(cfg.sorteadas, v); x++) s += C(v, x) * C(cfg.universo - v, cfg.sorteadas - x); return s / C(cfg.universo, cfg.sorteadas); })();
    out.fechamentos.push({ v, m, t, n: jogos.length, completo: C(v, cfg.k), pCondicao: pCond, chances: ch, jogos: jogos.map((x) => x.toString(36).padStart(5, '0')).join('') });
    console.log(slug, `v=${v} m=${m} t=${t}`, `${jogos.length} jogos`, `(completo ${C(v, cfg.k)})`, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  mkdirSync('public/fechamentos', { recursive: true });
  writeFileSync(`public/fechamentos/${slug}.json`, JSON.stringify(out));
}
