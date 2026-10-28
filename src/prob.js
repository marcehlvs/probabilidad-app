/* Lógica de probabilidad y combinatoria. Sin React: se puede testear con node. */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
export const randInt = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

export const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
export const perm = (n) => fact(n);
export const permRep = (n, groups) => fact(n) / groups.reduce((p, g) => p * fact(g), 1);
export const permCirc = (n) => fact(n - 1);
export const varSin = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
export const varCon = (n, k) => n ** k;
export const comb = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const combRep = (n, k) => comb(n + k - 1, k);

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export function frac(num, den) { const g = gcd(num, den) || 1; return { num: num / g, den: den / g }; }
export const fracStr = (f) => (f.den === 1 ? String(f.num) : `${f.num}/${f.den}`);

/** Acepta "1/6", "0,25", "0.25", "25%". Devuelve número o null. */
export function parseProb(s) {
  const t = String(s ?? "").trim().replace(",", ".").replace(/\s/g, "");
  if (!t) return null;
  if (t.endsWith("%")) { const v = Number(t.slice(0, -1)); return Number.isFinite(v) ? v / 100 : null; }
  if (t.includes("/")) { const [a, b] = t.split("/").map(Number); return Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? a / b : null; }
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}
export const closeTo = (given, expected, tol = 0.005) => given !== null && Math.abs(given - expected) <= tol;

/* ---- Árbol de dos extracciones de una urna ---- */
/** urna: { color: cantidad }. Devuelve ramas [{c1, c2, p1, p2, p}] */
export function treeTwoDraws(urn, replace) {
  const total = Object.values(urn).reduce((a, b) => a + b, 0);
  const rows = [];
  for (const c1 of Object.keys(urn)) {
    if (!urn[c1]) continue;
    const p1 = frac(urn[c1], total);
    for (const c2 of Object.keys(urn)) {
      const left = replace ? urn[c2] : urn[c2] - (c1 === c2 ? 1 : 0);
      const tot2 = replace ? total : total - 1;
      if (left <= 0) continue;
      const p2 = frac(left, tot2);
      rows.push({ c1, c2, p1, p2, p: frac(p1.num * p2.num, p1.den * p2.den) });
    }
  }
  return rows;
}
export const sumFrac = (fs) => fs.reduce((acc, f) => frac(acc.num * f.den + f.num * acc.den, acc.den * f.den), { num: 0, den: 1 });

/* ---- Tabla de doble entrada (condicional) ---- */
export function condFromTable(t) { // t = { a_b, a_nb, na_b, na_nb }
  const n = t.a_b + t.a_nb + t.na_b + t.na_nb;
  const A = t.a_b + t.a_nb, B = t.a_b + t.na_b;
  return { n, A, B, pA: frac(A, n), pB: frac(B, n), pAyB: frac(t.a_b, n), pA_B: frac(t.a_b, B), pB_A: frac(t.a_b, A),
    indep: t.a_b * n === A * B };
}

/* ---- Generador de ejercicios (semilla → mismo ejercicio) ---- */
const PALABRAS = ["LUNA", "MESA", "AMIGA", "PELOTA", "CASA", "ANANA", "MATEMATICA", "BANANA", "SALAS", "COLEGIO"];
const PEOPLE = ["alumnos", "amigos", "jugadores", "participantes"];

export const TIPOS = {
  perm: "Permutación simple",
  permRep: "Permutación con repetición",
  varSin: "Variación sin repetición",
  varCon: "Variación con repetición",
  comb: "Combinación",
};

export function makeCombExercise(seed, only) {
  const rnd = mulberry32(seed * 7919 + 13);
  const type = only || pick(rnd, Object.keys(TIPOS));
  if (type === "perm") {
    const n = randInt(rnd, 4, 7);
    return { type, n, text: `¿De cuántas formas pueden ubicarse ${n} ${pick(rnd, PEOPLE)} en una fila?`, answer: perm(n),
      formula: `Pₙ = n! = ${n}! `, steps: `Se usan todos los elementos y el orden importa: P${n} = ${n}! = ${fact(n)}` };
  }
  if (type === "permRep") {
    const w = pick(rnd, PALABRAS.filter((p) => new Set(p).size < p.length && p.length <= 8));
    const counts = {};
    for (const ch of w) counts[ch] = (counts[ch] || 0) + 1;
    const g = Object.values(counts).filter((c) => c > 1);
    return { type, text: `¿Cuántos anagramas (con o sin sentido) se pueden formar con las letras de la palabra ${w}?`,
      answer: permRep(w.length, Object.values(counts)),
      formula: `Pₙ^(a,b,…) = n! / (a!·b!·…)`,
      steps: `n = ${w.length}; repetidas: ${Object.entries(counts).filter(([, c]) => c > 1).map(([l, c]) => `${l} (${c} veces)`).join(", ")} → ${w.length}! / (${g.map((c) => c + "!").join("·")}) = ${permRep(w.length, Object.values(counts))}` };
  }
  if (type === "varSin") {
    const n = randInt(rnd, 6, 10), k = randInt(rnd, 2, 3);
    const roles = ["presidente, vicepresidente", "presidente, vice y tesorero"][k - 2];
    return { type, text: `En un grupo de ${n} personas se eligen ${k} cargos distintos (${roles}). ¿De cuántas maneras se pueden cubrir, si nadie ocupa dos cargos?`,
      answer: varSin(n, k), formula: `V(n,k) = n! / (n−k)!`, steps: `${Array.from({ length: k }, (_, i) => n - i).join(" · ")} = ${varSin(n, k)}` };
  }
  if (type === "varCon") {
    const n = pick(rnd, [2, 3, 4, 5, 6, 10]), k = randInt(rnd, 3, 4);
    const t = n === 10 ? `un código de ${k} dígitos (0 a 9)` : n === 6 ? `${k} tiradas sucesivas de un dado` : `una secuencia de ${k} resultados, cada uno con ${n} opciones`;
    return { type, text: `¿Cuántos resultados posibles hay en ${t}? Los valores pueden repetirse.`,
      answer: varCon(n, k), formula: `VR(n,k) = nᵏ`, steps: `${n}^${k} = ${varCon(n, k)}` };
  }
  const n = randInt(rnd, 6, 12), k = randInt(rnd, 2, 4);
  return { type: "comb", text: `De un curso de ${n} alumnos se elige una comisión de ${k} integrantes, todos con la misma función. ¿Cuántas comisiones distintas se pueden formar?`,
    answer: comb(n, k), formula: `C(n,k) = n! / (k!·(n−k)!)`, steps: `C(${n},${k}) = ${varSin(n, k)} / ${fact(k)} = ${comb(n, k)}` };
}

export function makeLaplaceExercise(seed) {
  const rnd = mulberry32(seed * 104729 + 7);
  const kind = randInt(rnd, 0, 3);
  const fin = (o) => { const f = frac(o.nA, o.nE); return { ...o, answer: f.num / f.den, show: fracStr(f) }; };

  if (kind === 0) {
    const defs = [["un número par", (n) => n % 2 === 0], ["un múltiplo de 3", (n) => n % 3 === 0], ["un número mayor que 4", (n) => n > 4],
      ["un número primo", (n) => [2, 3, 5].includes(n)], ["un número menor que 3", (n) => n < 3]];
    const [label, f] = pick(rnd, defs);
    const space = [1, 2, 3, 4, 5, 6], fav = space.filter(f);
    return fin({ text: `Se tira un dado. ¿Cuál es la probabilidad de obtener ${label}?`, space, fav, nE: 6, nA: fav.length });
  }
  if (kind === 1) {
    const n = randInt(rnd, 8, 12), m = randInt(rnd, 2, 4), k = randInt(rnd, n - 5, n - 2);
    const defs = [[`múltiplo de ${m}`, (x) => x % m === 0], [`mayor que ${k}`, (x) => x > k], ["par", (x) => x % 2 === 0], ["impar", (x) => x % 2 === 1]];
    const [label, f] = pick(rnd, defs);
    const space = Array.from({ length: n }, (_, i) => i + 1), fav = space.filter(f);
    return fin({ text: `En una urna hay ${n} bolitas numeradas del 1 al ${n}. Se extrae una al azar. ¿Cuál es la probabilidad de que el número sea ${label}?`,
      space, fav, nE: n, nA: fav.length });
  }
  if (kind === 2) {
    const s = randInt(rnd, 5, 11);
    const pairs = [];
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) pairs.push(`(${a},${b})`);
    return fin({ text: `Se tiran dos dados. ¿Cuál es la probabilidad de que la suma sea ${s}?`, space: null, fav: null, nE: 36, nA: pairs.length,
      favNote: `Casos favorables: ${pairs.join(", ")}. Son pares ordenados: cada dado tiene 6 caras, entonces #E = 6 · 6 = 36.` });
  }
  const r = randInt(rnd, 2, 6), a = randInt(rnd, 2, 6), v = randInt(rnd, 2, 6);
  return fin({ text: `En una urna hay ${r} bolitas rojas, ${a} azules y ${v} verdes. Se extrae una al azar. ¿Cuál es la probabilidad de que sea roja?`,
    space: null, fav: null, nE: r + a + v, nA: r, favNote: `#E = ${r} + ${a} + ${v} = ${r + a + v} (todas las bolitas) y #A = ${r} (las rojas).` });
}

/** Compara una lista escrita por el alumno ("1, 2, 3" o "{1;2;3}") con un conjunto de números. */
export function sameSet(input, arr) {
  const toks = String(input ?? "").replace(/[{}]/g, "").split(/[,;\s]+/).filter(Boolean);
  if (!toks.length) return false;
  const nums = toks.map(Number);
  if (nums.some((x) => !Number.isFinite(x))) return false;
  const u = [...new Set(nums)].sort((a, b) => a - b);
  return u.length === arr.length && u.every((x, i) => x === arr[i]);
}

export function makeCondExercise(seed) {
  const rnd = mulberry32(seed * 31337 + 5);
  const t = { a_b: randInt(rnd, 4, 15), a_nb: randInt(rnd, 3, 15), na_b: randInt(rnd, 3, 15), na_nb: randInt(rnd, 4, 15) };
  const c = condFromTable(t);
  return { t, c };
}

export function makeTreeExercise(seed) {
  const rnd = mulberry32(seed * 6151 + 3);
  const urn = { Rojas: randInt(rnd, 2, 5), Azules: randInt(rnd, 2, 5) };
  const replace = rnd() < 0.5;
  const tree = treeTwoDraws(urn, replace);
  const same = sumFrac(tree.filter((r) => r.c1 === r.c2).map((r) => r.p));
  const mix = sumFrac(tree.filter((r) => r.c1 !== r.c2).map((r) => r.p));
  return { urn, replace, tree, same, mix };
}

export const fmt = (v, d = 2) => (Number.isFinite(v) ? String(Math.round(v * 10 ** d) / 10 ** d).replace(".", ",") : "—");
/** Entero escrito con o sin separador de miles ("1.200", "1 200"). */
export const parseInteger = (s) => { const t = String(s ?? "").replace(/[.\s]/g, ""); return /^\d+$/.test(t) ? parseInt(t, 10) : null; };
export const COLOR_HEX = { Rojas: "#D97D7D", Azules: "#4F8FBF", Verdes: "#8FBF7F" };
