import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts";
import { RotateCcw } from "lucide-react";

const EXPS = {
  moneda: { label: "Moneda", outcomes: ["Cara", "Cruz"], roll: () => (Math.random() < 0.5 ? 0 : 1), theo: [0.5, 0.5], focus: 0 },
  dado: { label: "Dado", outcomes: ["1", "2", "3", "4", "5", "6"], roll: () => Math.floor(Math.random() * 6), theo: Array(6).fill(1 / 6), focus: 5 },
  dados: {
    label: "Suma de 2 dados",
    outcomes: Array.from({ length: 11 }, (_, i) => String(i + 2)),
    roll: () => Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6),
    theo: Array.from({ length: 11 }, (_, i) => (6 - Math.abs(i + 2 - 7)) / 36),
    focus: 5,
  },
};
const fresh = (key) => ({ counts: Array(EXPS[key].outcomes.length).fill(0), hist: [] });

export default function Simulador() {
  const [key, setKey] = useState("moneda");
  const [st, setSt] = useState(() => fresh("moneda"));
  const exp = EXPS[key];
  const n = st.counts.reduce((a, b) => a + b, 0);

  const run = (k) => {
    const counts = [...st.counts];
    const hist = [...st.hist];
    let total = n;
    const step = Math.max(1, Math.floor(k / 20));
    for (let i = 1; i <= k; i++) {
      counts[exp.roll()]++;
      total++;
      if (i % step === 0 || i === k) hist.push({ n: total, f: Math.round((counts[exp.focus] / total) * 1000) / 10 });
    }
    setSt({ counts, hist: hist.slice(-400) });
  };
  const choose = (k) => { setKey(k); setSt(fresh(k)); };

  const data = useMemo(() => exp.outcomes.map((o, i) => ({
    o, Observada: n ? Math.round((st.counts[i] / n) * 1000) / 10 : 0, Teórica: Math.round(exp.theo[i] * 1000) / 10,
  })), [st, exp, n]);
  const target = Math.round(exp.theo[exp.focus] * 1000) / 10;

  return (
    <div>
      <h3 className="ex-title">Simulador: ley de los grandes números</h3>
      <p className="ex-prompt">Cuantas más repeticiones, más se acerca la frecuencia relativa a la probabilidad teórica.</p>
      <div className="seg">
        {Object.entries(EXPS).map(([k, e]) => (
          <button key={k} className={`seg__btn ${key === k ? "seg__btn--active" : ""}`} onClick={() => choose(k)}>{e.label}</button>
        ))}
      </div>
      <div className="ex-actions" style={{ marginBottom: 12 }}>
        {[1, 10, 100, 1000].map((k) => <button key={k} className="btn btn--primary" onClick={() => run(k)}>+{k}</button>)}
        <button className="btn btn--ghost" onClick={() => setSt(fresh(key))}><RotateCcw size={14} /> reiniciar</button>
        <span className="eval-note" style={{ marginLeft: 8 }}>Repeticiones: <b>{n}</b></span>
      </div>
      <div className="chart-box" style={{ height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="o" /><YAxis unit="%" /><Tooltip /><Legend />
            <Bar dataKey="Observada" fill="#5FA8A0" /><Bar dataKey="Teórica" fill="#E8B33D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="eval-note">Evolución de la frecuencia relativa de «{exp.outcomes[exp.focus]}» (línea punteada = {String(target).replace(".", ",")} %).</p>
      <div className="chart-box" style={{ height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={st.hist}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="n" /><YAxis unit="%" domain={[0, 100]} /><Tooltip />
            <ReferenceLine y={target} stroke="#E8B33D" strokeDasharray="5 5" />
            <Line dataKey="f" name="Frecuencia relativa" stroke="#5FA8A0" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
