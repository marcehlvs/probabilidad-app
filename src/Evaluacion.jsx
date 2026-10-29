import { useMemo, useState } from "react";
import { Send, Shuffle } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { makeLaplaceExercise, makeCombExercise, makeCondExercise, makeTreeExercise, parseProb, parseInteger, closeTo, fracStr } from "./prob.js";
import { recordResult } from "./progress.js";

const TIPOS_ORDEN = ["perm", "permRep", "varSin", "varCon", "comb"];

function build(n) {
  const t1 = n % 5;
  const L1 = makeLaplaceExercise(n * 10 + 1);
  const L2 = makeLaplaceExercise(n * 10 + 2);
  const C1 = makeCombExercise(n * 10 + 3, TIPOS_ORDEN[t1]);
  const C2 = makeCombExercise(n * 10 + 4, TIPOS_ORDEN[(t1 + 2) % 5]);
  const D = makeCondExercise(n * 10 + 5);
  const T = makeTreeExercise(n * 10 + 6);
  const items = [
    { key: "l1", text: L1.text, ok: (v) => closeTo(parseProb(v), L1.answer), show: L1.show },
    { key: "l2", text: L2.text, ok: (v) => closeTo(parseProb(v), L2.answer), show: L2.show },
    { key: "c1", text: C1.text, ok: (v) => parseInteger(v) === C1.answer, show: String(C1.answer) },
    { key: "c2", text: C2.text, ok: (v) => parseInteger(v) === C2.answer, show: String(C2.answer) },
    {
      key: "d", show: fracStr(D.c.pA_B), ok: (v) => closeTo(parseProb(v), D.c.pA_B.num / D.c.pA_B.den),
      text: `En un grupo de ${D.c.n} ${D.ctx.pop}, ${D.c.A} ${D.ctx.aN} (A), ${D.c.B} ${D.ctx.bN} (B) y ${D.t.a_b} cumplen ambas condiciones. Se elige ${D.ctx.one} al azar y se sabe que cumple B. ¿Cuál es la probabilidad de que cumpla A? P(A | B)`,
    },
    {
      key: "t", show: fracStr(T.same), ok: (v) => closeTo(parseProb(v), T.same.num / T.same.den),
      text: `Una urna tiene ${T.urn.Rojas} bolitas rojas y ${T.urn.Azules} azules. Se sacan dos ${T.replace ? "con" : "sin"} reposición. ¿Cuál es la probabilidad de que sean del mismo color?`,
    },
  ];
  return items;
}

export default function Evaluacion() {
  const [n, setN] = useState(() => Math.floor(Math.random() * 900) + 100);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const items = useMemo(() => build(n), [n]);
  const res = items.map((it) => it.ok(ans[it.key] ?? ""));
  const score = res.filter(Boolean).length;

  const nueva = () => { setN(Math.floor(Math.random() * 900) + 100); setAns({}); setDone(false); };
  const entregar = () => {
    setDone(true);
    recordResult({ kind: "evaluacion", id: n, title: "Evaluación", score, total: items.length });
  };
  const pct = Math.round((score / items.length) * 100);

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Modo evaluación · N.º {n}</h3>
          <p className="ex-prompt">6 ejercicios. Las respuestas se corrigen recién al entregar.</p>
        </div>
        <button className="btn btn--ghost" onClick={nueva}><Shuffle size={14} /> nueva evaluación</button>
      </div>
      {items.map((it, i) => (
        <div className="eval-section" key={it.key}>
          <p className="eval-note"><b>{i + 1}.</b> {it.text}</p>
          <AnswerInput value={ans[it.key] ?? ""} width={110} disabled={done} inputMode={it.key[0] === "c" ? "numeric" : "text"}
            onChange={(v) => setAns({ ...ans, [it.key]: v })}
            state={done ? (res[i] ? "ok" : "bad") : undefined} hint={it.show} />
        </div>
      ))}
      {!done ? (
        <div className="ex-actions"><button className="btn btn--primary" onClick={entregar}><Send size={14} /> entregar</button></div>
      ) : (
        <div className={`score-banner ${pct >= 70 ? "score-banner--good" : pct >= 50 ? "score-banner--mid" : "score-banner--low"}`}>
          <span className="score-banner__num">{score} / {items.length}</span> ({pct} %)
        </div>
      )}
    </div>
  );
}
