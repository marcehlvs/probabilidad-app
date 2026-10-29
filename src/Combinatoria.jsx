import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AnswerInput, Choices } from "./ui.jsx";
import { TIPOS, makeCombExercise, parseInteger } from "./prob.js";
import { recordResult } from "./progress.js";

const FORMULAS = {
  perm: ["Pₙ = n!", "Se ordenan TODOS los elementos, sin repetidos."],
  permRep: ["Pₙ^(a,b,…) = n! / (a!·b!·…)", "Se ordenan todos, pero algunos son iguales (anagramas)."],
  varSin: ["V(n,k) = n! / (n−k)!", "Se eligen k de n, el orden importa, no se repite."],
  varCon: ["VR(n,k) = nᵏ", "Se eligen k de n, el orden importa, se puede repetir."],
  comb: ["C(n,k) = n! / (k!·(n−k)!)", "Se eligen k de n, el orden NO importa."],
};

function Guide() {
  const [todos, setTodos] = useState(null);
  const [rep, setRep] = useState(null);
  const [orden, setOrden] = useState(null);
  let res = null;
  if (todos === "si" && rep !== null) res = rep === "si" ? "permRep" : "perm";
  if (todos === "no" && orden === "no") res = "comb";
  if (todos === "no" && orden === "si" && rep !== null) res = rep === "si" ? "varCon" : "varSin";
  const yn = [["si", "Sí"], ["no", "No"]];
  return (
    <div>
      <h3 className="ex-title">¿Qué herramienta uso?</h3>
      <p className="eval-note">Respondé las preguntas y te digo qué fórmula corresponde.</p>
      <p><b>¿Se usan todos los elementos?</b> <Choices value={todos} onChange={(v) => { setTodos(v); setRep(null); setOrden(null); }} options={yn} /></p>
      {todos === "no" && <p><b>¿Importa el orden?</b> <Choices value={orden} onChange={(v) => { setOrden(v); setRep(null); }} options={yn} /></p>}
      {(todos === "si" || (todos === "no" && orden === "si")) && (
        <p><b>{todos === "si" ? "¿Hay elementos repetidos (iguales)?" : "¿Se pueden repetir los elementos?"}</b> <Choices value={rep} onChange={setRep} options={yn} /></p>
      )}
      {res && (
        <div className="ex-feedback ex-feedback--info">
          <b>{TIPOS[res]}</b><br />{FORMULAS[res][0]}<br />{FORMULAS[res][1]}
        </div>
      )}
    </div>
  );
}

function Practice() {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [type, setType] = useState(null);
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const ex = makeCombExercise(seed);
  const okType = type === ex.type;
  const okVal = parseInteger(val) === ex.answer;
  const next = () => { setSeed((s) => s + 1); setType(null); setVal(""); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordResult({ kind: "practica", id: seed, title: "Combinatoria", score: (okType ? 1 : 0) + (okVal ? 1 : 0), total: 2 });
  };
  return (
    <div>
      <div className="ex-header">
        <h3 className="ex-title">Practicar</h3>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <p className="eval-note">{ex.text}</p>
      <p><b>1. ¿Qué tipo de agrupamiento es?</b></p>
      <Choices value={type} onChange={(v) => { setType(v); setChecked(false); }} options={Object.entries(TIPOS)}
        state={checked ? (okType ? "ok" : "bad") : undefined} correct={TIPOS[ex.type]} />
      <p><b>2. Resultado:</b> <AnswerInput value={val} onChange={(v) => { setVal(v); setChecked(false); }} width={110}
        state={checked ? (okVal ? "ok" : "bad") : undefined} hint={String(ex.answer)} /></p>
      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check} disabled={!type || !val.trim()}>Verificar</button>
      </div>
      {checked && (
        <div className={`ex-feedback ${okType && okVal ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          <b>{okType && okVal ? "¡Muy bien!" : "Revisá la resolución:"}</b><br />
          {ex.formula}<br />{ex.steps}
        </div>
      )}
    </div>
  );
}

export default function Combinatoria() {
  const [mode, setMode] = useState("guia");
  return (
    <div>
      <div className="seg">
        <button className={`seg__btn ${mode === "guia" ? "seg__btn--active" : ""}`} onClick={() => setMode("guia")}>Guía de decisión</button>
        <button className={`seg__btn ${mode === "practica" ? "seg__btn--active" : ""}`} onClick={() => setMode("practica")}>Practicar</button>
      </div>
      {mode === "guia" ? <Guide /> : <Practice />}
    </div>
  );
}
