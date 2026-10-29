import { useState } from "react";
import { RotateCcw, Minus, Plus } from "lucide-react";
import { AnswerInput } from "./ui.jsx";
import { treeTwoDraws, makeTreeExercise, parseProb, closeTo, fracStr, frac, sumFrac, COLOR_HEX } from "./prob.js";
import { recordResult } from "./progress.js";

function Tree({ rows }) {
  const firsts = [...new Set(rows.map((r) => r.c1))];
  const dot = (c) => <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 10, background: COLOR_HEX[c] || "#aaa", marginRight: 6 }} />;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {firsts.map((c1) => {
        const sub = rows.filter((r) => r.c1 === c1);
        return (
          <div key={c1} style={{ borderLeft: `4px solid ${COLOR_HEX[c1] || "#aaa"}`, paddingLeft: 10 }}>
            <b>{dot(c1)}1ª {c1.toLowerCase()} — {fracStr(sub[0].p1)}</b>
            {sub.map((r) => (
              <div key={r.c2} style={{ marginLeft: 18, fontSize: 14 }}>
                → {dot(r.c2)}2ª {r.c2.toLowerCase()}: {fracStr(r.p2)} &nbsp;⇒&nbsp; {fracStr(r.p1)} · {fracStr(r.p2)} = <b>{fracStr(r.p)}</b>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Explorer() {
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
      {rows.length ? <Tree rows={rows} /> : <p className="eval-note">Poné al menos 2 bolitas.</p>}
      {rows.length > 0 && <p className="hc-note">Control: la suma de todas las ramas finales es {fracStr(check)} (siempre 1).</p>}
    </div>
  );
}

function Practice() {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 9000));
  const [ans, setAns] = useState({});
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

  const inp = (k, width = 64) => (
    <AnswerInput value={ans[k] ?? ""} width={width} inputMode="text" onChange={(v) => { setAns({ ...ans, [k]: v }); setChecked(false); }}
      state={checked ? (ok[k] ? "ok" : "bad") : undefined} hint={fracStr(fmap[k])} />
  );
  const next = () => { setSeed((s) => s + 1); setAns({}); setChecked(false); };
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
      <p><b>1. Completá las ramas</b> <span className="hc-note">(probabilidad de cada rama y producto a lo largo del camino)</span></p>
      {colors.map((c1) => (
        <div key={c1} style={{ borderLeft: `4px solid ${COLOR_HEX[c1]}`, paddingLeft: 10, margin: "8px 0 14px" }}>
          <div><b>1ª {c1.toLowerCase()}:</b> {inp(`p1_${c1}`)}</div>
          {ex.tree.filter((r) => r.c1 === c1).map((r) => (
            <div key={r.c2} style={{ marginLeft: 14, marginTop: 8 }}>
              → 2ª {r.c2.toLowerCase()}: {inp(`p2_${c1}_${r.c2}`)} &nbsp;⇒ producto: {inp(`pp_${c1}_${r.c2}`, 72)}
            </div>
          ))}
        </div>
      ))}
      <p><b>2. Calculá</b></p>
      <div className="eval-fields">
        {Q.map(([k, label]) => (
          <div className="eval-field" key={k}>
            <div className="eval-field__label">{label}</div>
            {inp(k, 90)}
          </div>
        ))}
      </div>
      <p className="hc-note">Escribí fracciones (3/10), decimales (0,3) o porcentajes (30%).</p>
      <div className="ex-actions"><button className="btn btn--primary" onClick={check}>Verificar</button></div>
      {checked && (
        <div className={`ex-feedback ${score === all.length ? "ex-feedback--ok" : "ex-feedback--info"}`}>
          {score === all.length ? "¡Perfecto!" : `${score} de ${all.length} correctas. Recordá: se multiplica a lo largo de cada rama y se suman las ramas que cumplen la condición. El árbol completo es:`}
          {score !== all.length && <div style={{ marginTop: 8 }}><Tree rows={ex.tree} /></div>}
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
