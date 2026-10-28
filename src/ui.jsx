import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { fmt } from "./prob.js";

/* Componentes compartidos por App, GroupedMeasures y Evaluation. */

export function Cell_({ children, state }) {
  return (
    <td className={`fc ${state === "ok" ? "fc--ok" : state === "bad" ? "fc--bad" : ""}`}>
      {children}
    </td>
  );
}

/**
 * hint     (opcional): si la respuesta está mal, muestra "= valor correcto".
 * disabled (opcional): bloquea el campo (se usa al entregar la evaluación).
 */
export function AnswerInput({ value, onChange, state, width = 64, suffix, hint, disabled = false, inputMode = "decimal" }) {
  return (
    <span className="ans-wrap">
      <input
        type="text"
        className={`ans-input ${state === "ok" ? "ans-input--ok" : state === "bad" ? "ans-input--bad" : ""}`}
        style={{ width }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        disabled={disabled}
      />
      {suffix && <span className="ans-suffix">{suffix}</span>}
      {state === "ok" && <Check size={14} className="ans-icon ans-icon--ok" />}
      {state === "bad" && <X size={14} className="ans-icon ans-icon--bad" />}
      {state === "bad" && hint !== undefined && <span className="ans-hint">= {typeof hint === "number" ? fmt(hint, 6) : hint}</span>}
    </span>
  );
}

export function MeasureCard({ label, formula, value, unit, children, open, onToggle }) {
  return (
    <div className="measure-card">
      <div className="measure-card__head" onClick={onToggle}>
        <div>
          <div className="measure-card__label">{label}</div>
          <div className="measure-card__value">
            {value} <span className="measure-card__unit">{unit}</span>
          </div>
        </div>
        <span className="measure-card__toggle">{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className="measure-card__body">
          <div className="measure-card__formula">{formula}</div>
          {children}
        </div>
      )}
    </div>
  );
}

/** Datos relevados, con scroll y botón para ordenarlos (útil con muchos datos). */
export function DataBox({ label, data }) {
  const [sorted, setSorted] = useState(false);
  const shown = useMemo(() => (sorted ? [...data].sort((a, b) => a - b) : data), [sorted, data]);
  return (
    <div className="raw-data">
      <div className="raw-data__toolbar">
        <span className="raw-data__label">
          {label} (n = {data.length}):
        </span>
        <button className="btn btn--ghost" onClick={() => setSorted((v) => !v)}>
          {sorted ? "ver como se relevaron" : "ordenar de menor a mayor"}
        </button>
      </div>
      <div className="raw-data__chips raw-data__chips--scroll">
        {shown.map((v, i) => (
          <span className="chip" key={i}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/** Botones de opción (una sola elección). options: [[valor, etiqueta], ...] */
export function Choices({ value, onChange, options, state, correct }) {
  return (
    <span className="seg" style={{ display: "inline-flex", flexWrap: "wrap", margin: "4px 0" }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          className={`seg__btn ${value === v ? "seg__btn--active" : ""}`}
          style={state === "bad" && value === v ? { borderColor: "#D97D7D" } : state === "ok" && value === v ? { borderColor: "#5FA8A0" } : undefined}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
      {state === "bad" && correct && <span className="ans-hint" style={{ marginLeft: 8 }}>= {correct}</span>}
    </span>
  );
}
