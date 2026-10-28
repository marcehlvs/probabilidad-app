// Verifica la lógica de combinatoria y probabilidad con miles de semillas.
// Uso: node test/verify-prob.mjs
import * as P from "../src/prob.js";

const fails = [];
const bad = (m) => fails.push(m);
const eq = (a, b, m) => { if (a !== b) bad(`${m}: ${a} ≠ ${b}`); };

eq(P.comb(10, 3), 120, "C(10,3)");
eq(P.comb(5, 0), 1, "C(5,0)");
eq(P.comb(7, 3), P.comb(7, 4), "simetría");
eq(P.permRep(8, [2, 3]), 3360, "perm rep");
eq(P.varSin(10, 3), 720, "V(10,3)");
eq(P.varCon(10, 4), 10000, "VR(10,4)");
eq(P.parseProb("1/6") - 1 / 6, 0, "fracción");
eq(P.parseProb("25%"), 0.25, "porcentaje");
eq(P.parseProb("0,5"), 0.5, "coma decimal");
eq(P.parseInteger("1.200"), 1200, "miles");

for (let s = 1; s <= 3000; s++) {
  const c = P.makeCombExercise(s);
  if (!Number.isInteger(c.answer) || c.answer <= 0) bad(`comb ${s}: respuesta inválida`);
  const l = P.makeLaplaceExercise(s);
  if (!(l.answer > 0 && l.answer <= 1)) bad(`laplace ${s}: fuera de rango`);
  if (Math.abs(l.nA / l.nE - l.answer) > 1e-9) bad(`laplace ${s}: #A/#E ≠ respuesta`);
  if (l.space && (l.space.length !== l.nE || l.fav.length !== l.nA)) bad(`laplace ${s}: espacio o favorables inconsistentes`);
  if (l.space && !P.sameSet(`{${l.space.join(", ")}}`, l.space)) bad(`laplace ${s}: sameSet falla`);
  const k = P.makeCondExercise(s);
  const { pA, pB, pAyB, pA_B } = k.c;
  const v = (f) => f.num / f.den;
  if (Math.abs(v(pA_B) - v(pAyB) / v(pB)) > 1e-9) bad(`cond ${s}: P(A|B) inconsistente`);
  const t = P.makeTreeExercise(s);
  const total = P.sumFrac(t.tree.map((r) => r.p));
  if (total.num !== total.den) bad(`árbol ${s}: las ramas no suman 1 (${P.fracStr(total)})`);
  const sm = P.sumFrac([t.same, t.mix]);
  if (sm.num !== sm.den) bad(`árbol ${s}: mismo + distinto ≠ 1`);
  if (P.makeCombExercise(s).text !== c.text) bad(`comb ${s}: no determinista`);
}

if (fails.length) { console.error(fails.slice(0, 20).join("\n")); process.exit(1); }
console.log("OK: combinatoria, Laplace, condicional y árbol verificados con 3000 semillas");
