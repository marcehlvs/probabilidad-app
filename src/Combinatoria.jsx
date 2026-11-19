import { useState } from "react";
import { RotateCcw, BookOpen } from "lucide-react";
import { AnswerInput, Choices } from "./ui.jsx";
import { TIPOS, makeCombExercise, parseInteger } from "./prob.js";
import { recordResult } from "./progress.js";
import CombTeoria from "./CombTeoria.jsx";

const FORMULAS = {
  perm: ["Pₙ = n!", "Se ordenan TODOS los elementos, sin repetidos."],
  permRep: ["Pₙ^(a,b,…) = n! / (a!·b!·…)", "Se ordenan todos, pero algunos son iguales (anagramas)."],
  varSin: ["V(n,k) = n! / (n−k)!", "Se eligen k de n, el orden importa, no se repite."],
  varCon: ["VR(n,k) = nᵏ", "Se eligen k de n, el orden importa, se puede repetir."],
  comb: ["C(n,k) = n! / (k!·(n−k)!)", "Se eligen k de n, el orden NO importa."],
};

function Guide({ onVer }) {
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
          <div style={{ marginTop: 8 }}>
            <button className="btn btn--ghost" onClick={() => onVer(res)}><BookOpen size={14} /> ¿en qué consiste?</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Practice({ onVer }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [solo, setSolo] = useState(false); // true: solo reconocer el tipo, sin calcular
  const [type, setType] = useState(null);
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [racha, setRacha] = useState({ ok: 0, total: 0 }); // aciertos de reconocimiento en esta sesión
  const ex = makeCombExercise(seed);
  const okType = type === ex.type;
  const okVal = parseInteger(val) === ex.answer;
  const reset = () => { setType(null); setVal(""); setChecked(false); };
  const next = () => { setSeed((s) => s + 1); reset(); };
  const cambiarModo = (v) => { setSolo(v); reset(); };
  const check = () => {
    setChecked(true);
    if (solo) {
      setRacha((r) => ({ ok: r.ok + (okType ? 1 : 0), total: r.total + 1 }));
      recordResult({ kind: "practica", id: seed, title: "Combinatoria (reconocer el tipo)", score: okType ? 1 : 0, total: 1 });
    } else {
      recordResult({ kind: "practica", id: seed, title: "Combinatoria", score: (okType ? 1 : 0) + (okVal ? 1 : 0), total: 2 });
    }
  };
  const listo = solo ? !!type : !!type && !!val.trim();
  const todoBien = solo ? okType : okType && okVal;
  return (
    <div>
      <div className="ex-header">
        <h3 className="ex-title">Practicar</h3>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <div className="seg">
        <button className={`seg__btn ${!solo ? "seg__btn--active" : ""}`} onClick={() => cambiarModo(false)}>Resolver completo</button>
        <button className={`seg__btn ${solo ? "seg__btn--active" : ""}`} onClick={() => cambiarModo(true)}>Solo reconocer el tipo</button>
      </div>
      {solo && <p className="eval-note">Sin cuentas: fijate qué se elige, si importa el orden y si se repite. Aciertos en esta sesión: {racha.ok} de {racha.total}.</p>}
      <p className="eval-note">{ex.text}</p>
      <p><b>{solo ? "¿Qué tipo de agrupamiento es?" : "1. ¿Qué tipo de agrupamiento es?"}</b></p>
      <Choices value={type} onChange={(v) => { setType(v); setChecked(false); }} options={Object.entries(TIPOS)}
        state={checked ? (okType ? "ok" : "bad") : undefined} correct={TIPOS[ex.type]} />
      {!solo && (
        <p><b>2. Resultado:</b> <AnswerInput value={val} onChange={(v) => { setVal(v); setChecked(false); }} width={110}
          state={checked ? (okVal ? "ok" : "bad") : undefined} hint={String(ex.answer)} /></p>
      )}
      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check} disabled={!listo}>Verificar</button>
      </div>
      {checked && (
        <div className={`ex-feedback ${todoBien ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          <b>{todoBien ? "¡Muy bien!" : "Revisá la resolución:"}</b><br />
          {solo ? <>Es {TIPOS[ex.type].toLowerCase()}: {FORMULAS[ex.type][1]}</> : <>{ex.formula}<br />{ex.steps}</>}
          {!okType && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn--ghost" onClick={() => onVer(ex.type)}><BookOpen size={14} /> repasar: {TIPOS[ex.type]}</button>
            </div>
          )}
          {solo && okType && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn--ghost" onClick={next}>siguiente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Combinatoria() {
  const [mode, setMode] = useState("guia");
  const [foco, setFoco] = useState(null); // tipo que se abre en la teoría
  const verTeoria = (tipo) => { setFoco(tipo); setMode("teoria"); };
  const modos = [["guia", "Guía de decisión"], ["teoria", "¿En qué consiste cada uno?"], ["practica", "Practicar"]];
  return (
    <div>
      <div className="seg">
        {modos.map(([k, label]) => (
          <button key={k} className={`seg__btn ${mode === k ? "seg__btn--active" : ""}`} onClick={() => { if (k === "teoria") setFoco(null); setMode(k); }}>{label}</button>
        ))}
      </div>
      {mode === "guia" && <Guide onVer={verTeoria} />}
      {mode === "teoria" && <CombTeoria key={foco || "inicio"} initial={foco} />}
      {mode === "practica" && <Practice onVer={verTeoria} />}
    </div>
  );
}
