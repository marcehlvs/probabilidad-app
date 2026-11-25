// Verifica los ejercicios por nivel: respuestas contra un cálculo independiente (fuerza bruta).
// Uso: node test/verify-ejercicios.mjs
import { LEVELS, TEMPLATES, makeLevelExercise, solvedExamples, tolFor } from "../src/ejercicios.js";
import { comb } from "../src/prob.js";

const fails = [];
const bad = (m) => fails.push(m);
const same = (ex, num, den, m) => { if (ex.num * den !== num * ex.den) bad(`${m}: ${ex.num}/${ex.den} ≠ ${num}/${den}`); };

// Todas las permutaciones de [0..n-1] (para el ejercicio de la fila)
function* perms(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  function* go(k) {
    if (k === n) { yield [...a]; return; }
    for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; yield* go(k + 1); [a[k], a[i]] = [a[i], a[k]]; }
  }
  yield* go(0);
}
// Todos los subconjuntos de tamaño k de [0..n-1]
function subsets(n, k) {
  const out = [];
  const go = (from, cur) => { if (cur.length === k) { out.push([...cur]); return; } for (let i = from; i < n; i++) { cur.push(i); go(i + 1, cur); cur.pop(); } };
  go(0, []);
  return out;
}

for (const L of LEVELS) {
  const n = TEMPLATES[L.id].length;
  if (n < 3) bad(`nivel ${L.id}: pocas plantillas`);
  if (solvedExamples(L.id).length !== n) bad(`nivel ${L.id}: ejemplos resueltos incompletos`);
}

const temas = {};
for (let s = 1; s <= 3000; s++) {
  for (const L of LEVELS) {
    const ex = makeLevelExercise(L.id, s);
    const m = `n${L.id} #${s} (${ex.tema})`;
    temas[`${L.id}:${ex.tIndex}`] = (temas[`${L.id}:${ex.tIndex}`] || 0) + 1;
    if (!(ex.num > 0 && ex.num <= ex.den)) bad(`${m}: probabilidad fuera de (0,1]`);
    if (Math.abs(ex.answer - ex.num / ex.den) > 1e-12) bad(`${m}: answer ≠ num/den`);
    if (!ex.text || !ex.idea || !Array.isArray(ex.steps) || ex.steps.length < 3) bad(`${m}: faltan textos`);
    if (ex.steps.some((t) => /NaN|undefined|Infinity/.test(t)) || /NaN|undefined/.test(ex.text)) bad(`${m}: texto con NaN/undefined`);
    if (!(tolFor(ex.answer) > 0)) bad(`${m}: tolerancia inválida`);
    if (makeLevelExercise(L.id, s).text !== ex.text) bad(`${m}: no determinista`);
    if (makeLevelExercise(L.id, s, ex.tIndex).text !== ex.text) bad(`${m}: tIndex forzado cambia el ejercicio`);
  }
}
for (const L of LEVELS) for (let i = 0; i < TEMPLATES[L.id].length; i++) if (!temas[`${L.id}:${i}`]) bad(`nivel ${L.id}: la plantilla ${i} nunca sale`);

// ---- Verificación independiente por plantilla ----
for (let s = 1; s <= 400; s++) {
  // Nivel 1
  let ex = makeLevelExercise(1, s, 0); same(ex, ex.p.n, 40, `n1 baraja #${s}`);
  ex = makeLevelExercise(1, s, 1); { const { r, a, v } = ex.p; same(ex, a + v, r + a + v, `n1 complemento #${s}`); }
  ex = makeLevelExercise(1, s, 2); same(ex, 1, 2 ** ex.p.n, `n1 moneda #${s}`);

  // Nivel 2: dos dados por enumeración
  ex = makeLevelExercise(2, s, 1);
  { let fav = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (ex.p.mayor ? a + b >= ex.p.s : a + b < ex.p.s) fav++; same(ex, fav, 36, `n2 dados #${s}`); }
  // sin reposición: enumerar pares ordenados de bolitas distintas
  ex = makeLevelExercise(2, s, 2);
  { const { r, a } = ex.p, N = r + a; let fav = 0, tot = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) { tot++; if (i < r && j < r) fav++; }
    same(ex, fav, tot, `n2 sin reposición #${s}`); }
  // independientes: 1 − P(ninguno) con enteros
  ex = makeLevelExercise(2, s, 3); same(ex, 100 - (10 - ex.p.a) * (10 - ex.p.b), 100, `n2 independientes #${s}`);
  // unión: enumerar el mazo (palo 0..3 = oros, copas, espadas, bastos; número 1..10; figuras 10, 11, 12)
  ex = makeLevelExercise(2, s, 0);
  { const { nA, nB, ov } = ex.p; if (nA + nB - ov > 40 || ov > Math.min(nA, nB)) bad(`n2 unión #${s}: datos imposibles`); }

  // Nivel 3: comisión por enumeración de subconjuntos
  ex = makeLevelExercise(3, s, 0);
  { const { m, w, k, j } = ex.p; let fav = 0; const todos = subsets(m + w, k);
    for (const c of todos) if (c.filter((x) => x < w).length === j) fav++;
    same(ex, fav, todos.length, `n3 comisión #${s}`); }
  // al menos uno: enumerar secuencias
  ex = makeLevelExercise(3, s, 1);
  { const { dado, n } = ex.p, caras = dado ? 6 : 2; let fav = 0; const tot = caras ** n;
    for (let x = 0; x < tot; x++) { let y = x, hay = false; for (let i = 0; i < n; i++) { if (y % caras === 0) hay = true; y = Math.floor(y / caras); } if (hay) fav++; }
    same(ex, fav, tot, `n3 al menos uno #${s}`); }
  // código: enumerar los 10^k códigos
  ex = makeLevelExercise(3, s, 2);
  { const k = ex.p.k, tot = 10 ** k; let fav = 0;
    for (let x = 0; x < tot; x++) { const d = String(x).padStart(k, "0").split(""); if (new Set(d).size === k) fav++; }
    same(ex, fav, tot, `n3 código #${s}`); }
  // condicional con dados: contar con los datos del ejercicio
  ex = makeLevelExercise(3, s, 3);
  { const { k, s: ss } = ex.p; let b = 0, ab = 0;
    for (let a = 1; a <= 6; a++) for (let c = 1; c <= 6; c++) if (a === k || c === k) { b++; if (a + c >= ss) ab++; }
    same(ex, ab, b, `n3 condicional #${s}`); }
}

for (let s = 1; s <= 60; s++) {
  // Nivel 4: total y Bayes con enteros
  const tot = makeLevelExercise(4, s, 0), bay = makeLevelExercise(4, s, 1);
  { const { share, d } = tot.p; same(tot, share.reduce((a, x, i) => a + x * d[i], 0), 10000, `n4 total #${s}`); }
  { const { share, d, i } = bay.p; const t = share.reduce((a, x, q) => a + x * d[q], 0); same(bay, share[i] * d[i], t, `n4 Bayes #${s}`);
    if (!(bay.num <= bay.den)) bad(`n4 Bayes #${s}: > 1`); }
  // Bayes: P(A|D) de las tres máquinas deben sumar 1
  const suma = [0, 1, 2].map((i) => { const { share, d } = bay.p; return share[i] * d[i]; }).reduce((a, b) => a + b, 0);
  const tt = bay.p.share.reduce((a, x, q) => a + x * bay.p.d[q], 0);
  if (suma !== tt) bad(`n4 Bayes #${s}: las tres máquinas no suman`);
  // fila: enumerar permutaciones (n ≤ 7 → 5040)
  const fila = makeLevelExercise(4, s, 2);
  { const n = fila.p.n; let fav = 0, totp = 0;
    for (const p of perms(n)) { totp++; if (Math.abs(p.indexOf(0) - p.indexOf(1)) === 1) fav++; }
    same(fila, fav, totp, `n4 fila #${s}`); }
  // tres bolitas: enumerar subconjuntos
  const tb = makeLevelExercise(4, s, 3);
  { const { r, a } = tb.p; const todos = subsets(r + a, 3); let fav = 0;
    for (const c of todos) { const rojas = c.filter((x) => x < r).length; if (rojas === 0 || rojas === 3) fav++; }
    same(tb, fav, todos.length, `n4 tres bolitas #${s}`); }
  // despeje: reconstruir un modelo con 20 casos y contar
  const de = makeLevelExercise(4, s, 4);
  { const { x, y, o } = de.p; const z = x + y - o; if (z > 20) bad(`n4 despeje #${s}: unión > 1`);
    // casos 0..19: A = primeros x, B = últimos y empezando en x-o → intersección o
    const inA = (i) => i < x, inB = (i) => i >= x - o && i < x - o + y;
    let a = 0, b = 0, ab = 0, u = 0; for (let i = 0; i < 20; i++) { if (inA(i)) a++; if (inB(i)) b++; if (inA(i) && inB(i)) ab++; if (inA(i) || inB(i)) u++; }
    if (a !== x || b !== y || u !== z) bad(`n4 despeje #${s}: modelo inconsistente`);
    same(de, ab, b, `n4 despeje #${s}`); }
}
if (comb(10, 3) !== 120) bad("comb de referencia");

if (fails.length) { console.error(fails.slice(0, 25).join("\n")); console.error(`… ${fails.length} fallas`); process.exit(1); }
console.log(`OK: ${LEVELS.length} niveles, ${Object.values(TEMPLATES).flat().length} plantillas verificadas con fuerza bruta`);
