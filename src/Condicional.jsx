import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AnswerInput, Choices } from "./ui.jsx";
import { makeCondExercise, parseProb, closeTo, fracStr } from "./prob.js";
import { recordResult } from "./progress.js";

const KEYS = [
  ["pA", "P(A)", (c) => c.pA],
  ["pB", "P(B)", (c) => c.pB],
  ["pAyB", "P(A ∩ B)", (c) => c.pAyB],
  ["pA_B", "P(A | B)", (c) => c.pA_B],
  ["pB_A", "P(B | A)", (c) => c.pB_A],
];

export default function Condicional() {
  const [seed, setSeed] = useState(1);
  const [ans, setAns] = useState({});
  const [indep, setIndep] = useState(null);
  const [checked, setChecked] = useState(false);
  const { t, c } = makeCondExercise(seed);
  const val = (f) => f.num / f.den;
  const res = Object.fromEntries(KEYS.map(([k, , get]) => [k, closeTo(parseProb(ans[k]), val(get(c)))]));
  const okIndep = indep === (c.indep ? "si" : "no");
  const score = Object.values(res).filter(Boolean).length + (okIndep ? 1 : 0);

  const next = () => { setSeed((s) => s + 1); setAns({}); setIndep(null); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordResult({ kind: "practica", id: seed, title: "Probabilidad condicional", score, total: KEYS.length + 1 });
  };

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Probabilidad condicional</h3>
          <p className="ex-prompt">P(A | B) = P(A ∩ B) / P(B): se achica el universo a los casos donde ocurrió B.</p>
        </div>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <p className="eval-note">Se encuestó a {c.n} estudiantes. A = practica un deporte · B = estudia un idioma. Se elige uno al azar.</p>
      <div className="table-wrap">
        <table className="freq-table">
          <thead><tr><th></th><th>B (idioma)</th><th>no B</th><th>Total</th></tr></thead>
          <tbody>
            <tr><th>A (deporte)</th><td>{t.a_b}</td><td>{t.a_nb}</td><td>{c.A}</td></tr>
            <tr><th>no A</th><td>{t.na_b}</td><td>{t.na_nb}</td><td>{t.na_b + t.na_nb}</td></tr>
            <tr><th>Total</th><td>{c.B}</td><td>{t.a_nb + t.na_nb}</td><td>{c.n}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="eval-fields">
        {KEYS.map(([k, label, get]) => (
          <div className="eval-field" key={k}>
            <div className="eval-field__label">{label}</div>
            <AnswerInput value={ans[k] ?? ""} width={90} onChange={(v) => { setAns({ ...ans, [k]: v }); setChecked(false); }}
              state={checked ? (res[k] ? "ok" : "bad") : undefined} hint={fracStr(get(c))} />
          </div>
        ))}
      </div>
      <p><b>¿A y B son independientes?</b> (P(A | B) = P(A)) <Choices value={indep} onChange={(v) => { setIndep(v); setChecked(false); }}
        options={[["si", "Sí"], ["no", "No"]]} state={checked ? (okIndep ? "ok" : "bad") : undefined} correct={c.indep ? "Sí" : "No"} /></p>
      <p className="hc-note">Escribí fracciones (3/10), decimales (0,3) o porcentajes (30%).</p>
      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check}>Verificar</button>
      </div>
      {checked && (
        <div className={`ex-feedback ${score === KEYS.length + 1 ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          {score === KEYS.length + 1 ? "¡Todo correcto!" : `${score} de ${KEYS.length + 1} correctas. Recordá: en P(A | B) el denominador es el total de la columna B.`}
        </div>
      )}
    </div>
  );
}
