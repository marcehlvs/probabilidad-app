import { useState } from "react";
import { RotateCcw, ChevronDown, ChevronUp, Lightbulb, ArrowUpRight } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { parseProb, closeTo, fmt } from "./prob.js";
import { LEVELS, makeLevelExercise, solvedExamples, tolFor } from "./ejercicios.js";
import { recordResult } from "./progress.js";

const RACHA_PARA_SUBIR = 3;

function Resolucion({ ex }) {
  return (
    <div className="sol-body">
      <p className="sol-idea"><Lightbulb size={14} /> <b>Idea clave:</b> {ex.idea}</p>
      <ol className="sol-steps">
        {ex.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <p className="sol-answer">Respuesta: <b>P = {ex.show}</b> ≈ {fmt(ex.answer, 4)} ({fmt(ex.answer * 100, 2)} %)</p>
    </div>
  );
}

function Resueltos({ level, onPracticar }) {
  const [open, setOpen] = useState({});
  const ejemplos = solvedExamples(level);
  const toggle = (i) => setOpen((o) => ({ ...o, [i]: !o[i] }));
  return (
    <div>
      <p className="eval-note">Primero intentá resolver cada uno por tu cuenta y después abrí la resolución para comparar los pasos.</p>
      {ejemplos.map((ex, i) => (
        <div className="sol-card" key={i}>
          <div className="sol-card__head">
            <span className="sol-card__tag">Ejemplo {i + 1} · {ex.tema}</span>
          </div>
          <p className="sol-card__text">{ex.text}</p>
          <button className="btn btn--ghost" onClick={() => toggle(i)}>
            {open[i] ? <><ChevronUp size={14} /> ocultar resolución</> : <><ChevronDown size={14} /> ver resolución</>}
          </button>
          {open[i] && <Resolucion ex={ex} />}
        </div>
      ))}
      <div className="ex-actions">
        <button className="btn btn--primary" onClick={onPracticar}><ArrowUpRight size={14} /> practicar este nivel</button>
      </div>
    </div>
  );
}

function Practica({ level, onSubir }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [pista, setPista] = useState(false);
  const [racha, setRacha] = useState({ ok: 0, total: 0, seguidas: 0 });
  const ex = makeLevelExercise(level, seed);
  const ok = closeTo(parseProb(val), ex.answer, tolFor(ex.answer));

  const next = () => { setSeed((s) => s + 1); setVal(""); setChecked(false); setPista(false); };
  const check = () => {
    if (checked) return;
    setChecked(true);
    setRacha((r) => ({ ok: r.ok + (ok ? 1 : 0), total: r.total + 1, seguidas: ok ? r.seguidas + 1 : 0 }));
    recordResult({ kind: "practica", id: seed, title: `Ejercicios · Nivel ${level}`, score: ok ? 1 : 0, total: 1 });
  };
  const puedeSubir = checked && ok && racha.seguidas >= RACHA_PARA_SUBIR && level < LEVELS.length;

  return (
    <div>
      <div className="ex-header">
        <p className="eval-note" style={{ margin: 0 }}>Aciertos en esta sesión: {racha.ok} de {racha.total}</p>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <div className="sol-card">
        <div className="sol-card__head"><span className="sol-card__tag">{ex.tema}</span></div>
        <p className="sol-card__text">{ex.text}</p>
        <p>P = <AnswerInput value={val} onChange={(v) => { setVal(v); setChecked(false); }} width={110} inputMode="text"
          state={checked ? (ok ? "ok" : "bad") : undefined} hint={ex.show} /></p>
        <p className="hc-note">Podés escribir una fracción (3/10), un decimal (0,3) o un porcentaje (30%).</p>
        <div className="ex-actions">
          <button className="btn btn--primary" onClick={check} disabled={!val.trim() || checked}>Verificar</button>
          {!checked && <button className="btn btn--ghost" onClick={() => setPista((v) => !v)}><Lightbulb size={14} /> {pista ? "ocultar pista" : "ver pista"}</button>}
        </div>
        {pista && !checked && <div className="ex-feedback ex-feedback--info">{ex.idea}</div>}
      </div>
      {checked && (
        <div className={`ex-feedback ${ok ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          <b>{ok ? "¡Correcto!" : "Todavía no. Mirá la resolución:"}</b>
          <Resolucion ex={ex} />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--ghost" onClick={next}>siguiente</button>
            {puedeSubir && <button className="btn btn--primary" onClick={onSubir}><ArrowUpRight size={14} /> {RACHA_PARA_SUBIR} seguidas: pasar al nivel {level + 1}</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Ejercicios() {
  const [mode, setMode] = useState("resueltos");
  const [level, setLevel] = useState(1);
  const cur = LEVELS.find((l) => l.id === level);
  const irANivel = (n) => { setLevel(n); setMode("resueltos"); };
  return (
    <div>
      <h3 className="ex-title">Ejercicios por nivel</h3>
      <p className="ex-prompt">Cuatro niveles con dificultad creciente. En cada uno: ejemplos resueltos y explicados, y problemas nuevos para practicar.</p>
      <div className="seg seg--wrap">
        {LEVELS.map((l) => (
          <button key={l.id} className={`seg__btn ${level === l.id ? "seg__btn--active" : ""}`} onClick={() => setLevel(l.id)}>{l.name}</button>
        ))}
      </div>
      <p className="eval-note">{cur.desc}</p>
      <div className="seg">
        <button className={`seg__btn ${mode === "resueltos" ? "seg__btn--active" : ""}`} onClick={() => setMode("resueltos")}>Resueltos y explicados</button>
        <button className={`seg__btn ${mode === "practica" ? "seg__btn--active" : ""}`} onClick={() => setMode("practica")}>Para practicar</button>
      </div>
      {mode === "resueltos"
        ? <Resueltos key={level} level={level} onPracticar={() => setMode("practica")} />
        : <Practica key={level} level={level} onSubir={() => irANivel(level + 1)} />}
    </div>
  );
}
