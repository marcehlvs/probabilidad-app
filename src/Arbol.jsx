import { useState } from "react";
import { RotateCcw, Minus, Plus } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { treeTwoDraws, makeTreeExercise, parseProb, closeTo, fracStr, frac, sumFrac, COLOR_HEX } from "./prob.js";
import { recordResult } from "./progress.js";

const INK = "#2B2A26";
const PAPER = "#FAF7F0";
const initial = (c) => c.charAt(0);

/**
 * Diagrama de árbol de dos extracciones, dibujado de izquierda a derecha.
 * Sin `inputs`: muestra las probabilidades. Con `inputs`: pone un casillero sobre cada rama y cada resultado.
 * inputs = { ans, setAns, ok, checked, fmap }
 */
export function TreeDiagram({ rows, inputs }) {
  const L = rows.length;
  const rowH = L > 6 ? 56 : 70;
  const H = Math.max(200, L * rowH);
  const TOP = 26;
  const xR = 26, x1 = 250, x2 = 470;
  const firsts = [...new Set(rows.map((r) => r.c1))];
  const yLeaf = rows.map((_, i) => (i + 0.5) * (H / L));
  const yFirst = Object.fromEntries(firsts.map((c) => {
    const ys = rows.map((r, i) => (r.c1 === c ? yLeaf[i] : null)).filter((v) => v !== null);
    return [c, ys.reduce((a, b) => a + b, 0) / ys.length];
  }));
  const yR = H / 2;
  const colorsPresent = [...new Set(rows.flatMap((r) => [r.c1, r.c2]))];

  const Cell = ({ cx, cy, k, f, w = 56 }) => {
    if (!inputs) {
      const label = fracStr(f), bw = label.length * 9 + 14;
      return (
        <g>
          <rect x={cx - bw / 2} y={cy - 12} width={bw} height={24} rx="5" fill={PAPER} />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill={INK}>{label}</text>
        </g>
      );
    }
    const { ans, setAns, ok, checked } = inputs;
    return (
      <foreignObject x={cx - w / 2} y={cy - 17} width={w + 70} height={34} style={{ overflow: "visible" }}>
        <AnswerInput value={ans[k] ?? ""} width={w} inputMode="text" onChange={(v) => setAns(k, v)}
          state={checked ? (ok[k] ? "ok" : "bad") : undefined} hint={fracStr(f)} />
      </foreignObject>
    );
  };

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 640 ${H + TOP + 8}`} style={{ width: "100%", minWidth: 600, height: "auto", display: "block" }}
          fontFamily="Inter, sans-serif" role="img" aria-label="Diagrama de árbol">
          <text x={x1} y="14" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7A6F58">1ª extracción</text>
          <text x={x2 + 40} y="14" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7A6F58">2ª extracción y resultado</text>
          <g transform={`translate(0 ${TOP})`}>
            {/* líneas */}
            {firsts.map((c1) => <line key={`l1-${c1}`} x1={xR} y1={yR} x2={x1} y2={yFirst[c1]} stroke={COLOR_HEX[c1] || "#999"} strokeWidth="2.5" />)}
            {rows.map((r, i) => <line key={`l2-${i}`} x1={x1} y1={yFirst[r.c1]} x2={x2} y2={yLeaf[i]} stroke={COLOR_HEX[r.c2] || "#999"} strokeWidth="2.5" />)}
            {/* nodos */}
            <circle cx={xR} cy={yR} r="9" fill="#1F3A34" />
            {firsts.map((c1) => (
              <g key={`n1-${c1}`}>
                <circle cx={x1} cy={yFirst[c1]} r="14" fill={COLOR_HEX[c1] || "#999"} />
                <text x={x1} y={yFirst[c1] + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{initial(c1)}</text>
              </g>
            ))}
            {rows.map((r, i) => (
              <g key={`n2-${i}`}>
                <circle cx={x2} cy={yLeaf[i]} r="12" fill={COLOR_HEX[r.c2] || "#999"} />
                <text x={x2} y={yLeaf[i] + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{initial(r.c2)}</text>
              </g>
            ))}
            {/* probabilidades sobre las ramas */}
            {firsts.map((c1) => {
              const r0 = rows.find((r) => r.c1 === c1);
              return <Cell key={`p1-${c1}`} cx={(xR + x1) / 2 + 6} cy={(yR + yFirst[c1]) / 2} k={`p1_${c1}`} f={r0.p1} />;
            })}
            {rows.map((r, i) => (
              <Cell key={`p2-${i}`} cx={(x1 + x2) / 2 + 8} cy={(yFirst[r.c1] + yLeaf[i]) / 2} k={`p2_${r.c1}_${r.c2}`} f={r.p2} />
            ))}
            {/* resultado de cada camino */}
            {rows.map((r, i) => (
              <g key={`res-${i}`}>
                <text x={x2 + 22} y={yLeaf[i] - 8} fontSize="13" fontWeight="700" fill={INK}>{initial(r.c1)}{initial(r.c2)}</text>
                {inputs ? (
                  <foreignObject x={x2 + 18} y={yLeaf[i] - 3} width={132} height={34} style={{ overflow: "visible" }}>
                    <AnswerInput value={inputs.ans[`pp_${r.c1}_${r.c2}`] ?? ""} width={60} inputMode="text" onChange={(v) => inputs.setAns(`pp_${r.c1}_${r.c2}`, v)}
                      state={inputs.checked ? (inputs.ok[`pp_${r.c1}_${r.c2}`] ? "ok" : "bad") : undefined} hint={fracStr(r.p)} />
                  </foreignObject>
                ) : (
                  <text x={x2 + 22} y={yLeaf[i] + 12} fontSize="14" fontWeight="600" fill="#5A5142">= {fracStr(r.p)}</text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
      <p className="hc-note">{colorsPresent.map((c) => `${initial(c)} = ${c.toLowerCase()}`).join(" · ")}. Sobre cada rama va su probabilidad; al final, el producto de las dos ramas del camino.</p>
    </div>
  );
}

export function Explorer() {
  const [urn, setUrn] = useState({ Rojas: 3, Azules: 2, Verdes: 0 });
  const [replace, setReplace] = useState(false);
  const total = Object.values(urn).reduce((a, b) => a + b, 0);
  const rows = total >= 2 ? treeTwoDraws(urn, replace) : [];
  const set = (c, d) => setUrn({ ...urn, [c]: Math.max(0, Math.min(8, urn[c] + d)) });
  const check = sumFrac(rows.map((r) => r.p));
  return (
    <div>
      <h3 className="ex-title">Explorá el árbol</h3>
      <p className="eval-note">Armá una urna y mirá cómo cambian las ramas al sacar dos bolitas.</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        {Object.keys(urn).map((c) => (
          <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 12, background: COLOR_HEX[c] }} /> {c}
            <button className="btn btn--ghost" onClick={() => set(c, -1)}><Minus size={12} /></button>
            <b>{urn[c]}</b>
            <button className="btn btn--ghost" onClick={() => set(c, 1)}><Plus size={12} /></button>
          </span>
        ))}
      </div>
      <div className="seg">
        <button className={`seg__btn ${!replace ? "seg__btn--active" : ""}`} onClick={() => setReplace(false)}>Sin reposición</button>
        <button className={`seg__btn ${replace ? "seg__btn--active" : ""}`} onClick={() => setReplace(true)}>Con reposición</button>
      </div>
      {rows.length ? <TreeDiagram rows={rows} /> : <p className="eval-note">Poné al menos 2 bolitas.</p>}
      {rows.length > 0 && <p className="hc-note">Control: la suma de todos los resultados finales es {fracStr(check)} (siempre 1).</p>}
    </div>
  );
}

export function Practice() {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [ans, setAnsState] = useState({});
  const [checked, setChecked] = useState(false);
  const ex = makeTreeExercise(seed);
  const colors = Object.keys(ex.urn);
  const total = ex.urn.Rojas + ex.urn.Azules;
  const rr = ex.tree.find((r) => r.c1 === "Rojas" && r.c2 === "Azules");

  const branches = [
    ...colors.map((c) => [`p1_${c}`, frac(ex.urn[c], total)]),
    ...ex.tree.flatMap((r) => [[`p2_${r.c1}_${r.c2}`, r.p2], [`pp_${r.c1}_${r.c2}`, r.p]]),
  ];
  const Q = [
    ["rojaAzul", "P(1ª roja y 2ª azul)", rr.p],
    ["same", "P(las dos del mismo color)", ex.same],
    ["mix", "P(de distinto color)", ex.mix],
  ];
  const all = [...branches, ...Q.map(([k, , f]) => [k, f])];
  const fmap = Object.fromEntries(all);
  const ok = Object.fromEntries(all.map(([k, f]) => [k, closeTo(parseProb(ans[k]), f.num / f.den)]));
  const score = Object.values(ok).filter(Boolean).length;
  const setAns = (k, v) => { setAnsState((a) => ({ ...a, [k]: v })); setChecked(false); };

  const next = () => { setSeed((s) => s + 1); setAnsState({}); setChecked(false); };
  const check = () => { setChecked(true); recordResult({ kind: "practica", id: seed, title: "Diagrama de árbol", score, total: all.length }); };

  return (
    <div>
      <div className="ex-header">
        <h3 className="ex-title">Practicar</h3>
        <button className="btn btn--ghost" onClick={next}><RotateCcw size={14} /> otro problema</button>
      </div>
      <p className="eval-note">
        Una urna tiene {ex.urn.Rojas} bolitas rojas y {ex.urn.Azules} azules. Se sacan dos bolitas {ex.replace ? "CON reposición" : "SIN reposición"}.
      </p>
      <p><b>1. Completá el árbol</b> <span className="hc-note">(probabilidad de cada rama y producto de cada camino)</span></p>
      <TreeDiagram rows={ex.tree} inputs={{ ans, setAns, ok, checked, fmap }} />
      <p><b>2. Calculá</b></p>
      <div className="eval-fields">
        {Q.map(([k, label, f]) => (
          <div className="eval-field" key={k}>
            <div className="eval-field__label">{label}</div>
            <AnswerInput value={ans[k] ?? ""} width={90} inputMode="text" onChange={(v) => setAns(k, v)}
              state={checked ? (ok[k] ? "ok" : "bad") : undefined} hint={fracStr(f)} />
          </div>
        ))}
      </div>
      <p className="hc-note">Escribí fracciones (3/10), decimales (0,3) o porcentajes (30%).</p>
      <div className="ex-actions"><button className="btn btn--primary" onClick={check}>Verificar</button></div>
      {checked && (
        <div className={`ex-feedback ${score === all.length ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          {score === all.length ? "¡Perfecto!" : `${score} de ${all.length} correctas. Recordá: se multiplica a lo largo de cada camino y se suman los caminos que cumplen la condición. Mirá las respuestas en rojo.`}
        </div>
      )}
    </div>
  );
}

export default function Arbol() {
  const [mode, setMode] = useState("explorar");
  return (
    <div>
      <div className="seg">
        <button className={`seg__btn ${mode === "explorar" ? "seg__btn--active" : ""}`} onClick={() => setMode("explorar")}>Explorar</button>
        <button className={`seg__btn ${mode === "practica" ? "seg__btn--active" : ""}`} onClick={() => setMode("practica")}>Practicar</button>
      </div>
      {mode === "explorar" ? <Explorer /> : <Practice />}
    </div>
  );
}
