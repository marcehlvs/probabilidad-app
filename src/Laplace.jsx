import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { makeLaplaceExercise, parseProb, parseInteger, sameSet, closeTo } from "./prob.js";
import { recordResult } from "./progress.js";

export default function Laplace() {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [a, setA] = useState({});
  const [checked, setChecked] = useState(false);
  const ex = makeLaplaceExercise(seed);
  const listed = Boolean(ex.space);

  const res = {
    E: listed ? sameSet(a.E, ex.space) : null,
    nE: parseInteger(a.nE) === ex.nE,
    A: listed ? sameSet(a.A, ex.fav) : null,
    nA: parseInteger(a.nA) === ex.nA,
    P: closeTo(parseProb(a.P), ex.answer),
  };
  const keys = Object.keys(res).filter((k) => res[k] !== null);
  const score = keys.filter((k) => res[k]).length;
  const st = (k) => (checked ? (res[k] ? "ok" : "bad") : undefined);
  const set = (k) => (v) => { setA({ ...a, [k]: v }); setChecked(false); };

  const next = () => { setSeed((s) => s + 1); setA({}); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordResult({ kind: "practica", id: seed, title: "Regla de Laplace", score, total: keys.length });
  };
  const hintList = (arr) => `{${arr.join(", ")}}`;

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Regla de Laplace</h3>
          <p className="ex-prompt">Si todos los resultados son igualmente probables: P(A) = #A / #E, casos favorables sobre casos posibles.</p>
        </div>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <p className="eval-note">{ex.text}</p>

      {listed && (
        <p>E = {"{"} <AnswerInput value={a.E ?? ""} onChange={set("E")} width={230} inputMode="text" state={st("E")} hint={hintList(ex.space)} /> {"}"}
          <span className="hc-note"> &nbsp;escribí los elementos separados por comas</span></p>
      )}
      <p>#E = <AnswerInput value={a.nE ?? ""} onChange={set("nE")} width={70} inputMode="numeric" state={st("nE")} hint={String(ex.nE)} /></p>
      {listed && (
        <p>A = {"{"} <AnswerInput value={a.A ?? ""} onChange={set("A")} width={230} inputMode="text" state={st("A")} hint={hintList(ex.fav)} /> {"}"}
          <span className="hc-note"> &nbsp;los casos favorables</span></p>
      )}
      <p>#A = <AnswerInput value={a.nA ?? ""} onChange={set("nA")} width={70} inputMode="numeric" state={st("nA")} hint={String(ex.nA)} /></p>
      <p>P(A) = #A / #E = <AnswerInput value={a.P ?? ""} onChange={set("P")} width={90} inputMode="text" state={st("P")} hint={ex.show} /></p>
      <p className="hc-note">La probabilidad podés escribirla como fracción (1/6), decimal (0,17) o porcentaje (17%).</p>

      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check} disabled={!a.P?.trim()}>Verificar</button>
      </div>
      {checked && (
        <div className={`ex-feedback ${score === keys.length ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          {score === keys.length ? "¡Correcto!" : `${score} de ${keys.length} correctas. Resolución: #E = ${ex.nE}, #A = ${ex.nA} → P(A) = ${ex.nA}/${ex.nE} = ${ex.show}.`}
          {score !== keys.length && ex.favNote && <div style={{ marginTop: 6 }}>{ex.favNote}</div>}
        </div>
      )}

      <h4 style={{ marginTop: 22 }}>Vocabulario</h4>
      <ul className="eval-note" style={{ lineHeight: 1.6 }}>
        <li><b>Espacio muestral (E):</b> conjunto de todos los resultados posibles. <b>#E</b> es la cantidad de elementos de E.</li>
        <li><b>Suceso (A):</b> subconjunto de E. <b>#A</b> es la cantidad de casos favorables. <b>Complemento:</b> P(Aᶜ) = 1 − P(A).</li>
        <li><b>Incompatibles:</b> no pueden ocurrir juntos → P(A ∪ B) = P(A) + P(B).</li>
        <li><b>En general:</b> P(A ∪ B) = P(A) + P(B) − P(A ∩ B).</li>
      </ul>
    </div>
  );
}
