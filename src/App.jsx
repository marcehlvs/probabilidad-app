import { useState } from "react";
import Laplace from "./Laplace.jsx";
import Combinatoria from "./Combinatoria.jsx";
import Condicional from "./Condicional.jsx";
import Arbol from "./Arbol.jsx";
import Simulador from "./Simulador.jsx";
import Evaluacion from "./Evaluacion.jsx";
import FormulaSheet from "./FormulaSheet.jsx";
import Progress from "./Progress.jsx";
import Groups from "./Groups.jsx";
import "./theme.css";
import "./extras.css";

const TABS = [
  ["laplace", "1 · Laplace y sucesos", Laplace],
  ["simulador", "2 · Simulador", Simulador],
  ["combinatoria", "3 · Combinatoria", Combinatoria],
  ["condicional", "4 · Condicional", Condicional],
  ["arbol", "5 · Diagramas de árbol", Arbol],
  ["evaluacion", "6 · Modo evaluación", Evaluacion],
  ["formulas", "7 · Hoja de fórmulas", FormulaSheet],
  ["progreso", "8 · Mi progreso", Progress],
  ["grupos", "9 · Armar grupos", Groups],
];

export default function App() {
  const [tab, setTab] = useState("laplace");
  const Active = TABS.find(([k]) => k === tab)[2];
  return (
    <div className="board-app">
      <div className="board-header">
        <h1 className="board-title">Probabilidad desde cero</h1>
        <p className="board-subtitle">5° año — azar, combinatoria, condicional y árboles</p>
      </div>
      <div className="tabs-row">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`chalk-tab ${tab === k ? "chalk-tab--active" : ""}`}>{label}</button>
        ))}
      </div>
      <div className="paper"><Active key={tab} /></div>
    </div>
  );
}
