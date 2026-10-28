import { Printer } from "lucide-react";

const SECCIONES = [
  { titulo: "Probabilidad básica", items: [
    ["Regla de Laplace", "P(A) = #A / #E (casos favorables sobre casos posibles; resultados equiprobables)"],
    ["Notación", "E: espacio muestral · #E: cantidad de elementos de E · #A: cantidad de casos favorables"],
    ["Rango", "0 ≤ P(A) ≤ 1 · P(suceso seguro) = 1 · P(imposible) = 0"],
    ["Complemento", "P(Aᶜ) = 1 − P(A)"],
    ["Unión", "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)"],
    ["Incompatibles", "Si A ∩ B = ∅: P(A ∪ B) = P(A) + P(B)"],
    ["Frecuencia relativa", "Con muchas repeticiones, fr(A) se acerca a P(A) (ley de los grandes números)."],
  ] },
  { titulo: "Probabilidad condicional", items: [
    ["Condicional", "P(A | B) = P(A ∩ B) / P(B), con P(B) > 0"],
    ["Regla del producto", "P(A ∩ B) = P(B) · P(A | B)"],
    ["Independientes", "P(A ∩ B) = P(A) · P(B) ⇔ P(A | B) = P(A)"],
    ["Total (árbol)", "P(A) = Σ P(rama) · P(A | rama)"],
  ] },
  { titulo: "Diagramas de árbol", items: [
    ["Rama completa", "Se multiplican las probabilidades a lo largo de la rama."],
    ["Varias ramas", "Se suman las probabilidades de las ramas que cumplen la condición."],
    ["Con reposición", "Las probabilidades de la 2ª extracción no cambian (eventos independientes)."],
    ["Sin reposición", "Cambian el total y la cantidad de la urna en la 2ª extracción."],
    ["Control", "La suma de todas las ramas finales es 1."],
  ] },
  { titulo: "Combinatoria", items: [
    ["Factorial", "n! = n · (n−1) · … · 2 · 1 · 0! = 1"],
    ["Permutación simple", "Pₙ = n!"],
    ["Permutación con repetición", "Pₙ^(a,b,…) = n! / (a!·b!·…)"],
    ["Variación sin repetición", "V(n,k) = n! / (n−k)!"],
    ["Variación con repetición", "VR(n,k) = nᵏ"],
    ["Combinación", "C(n,k) = n! / (k!·(n−k)!)"],
    ["¿Cuál uso?", "¿Entran todos? → permutación · ¿Importa el orden? → variación, si no → combinación."],
  ] },
];

export default function FormulaSheet() {
  return (
    <div className="formula-sheet">
      <div className="formula-sheet__bar no-print">
        <h3 className="ex-title">Hoja de fórmulas</h3>
        <button className="btn btn--primary" onClick={() => window.print()}><Printer size={14} /> imprimir / guardar PDF</button>
      </div>
      <h2 className="formula-sheet__print-title">Probabilidad · hoja de fórmulas</h2>
      <div className="formula-cols">
        {SECCIONES.map((s) => (
          <section className="formula-block" key={s.titulo}>
            <h4>{s.titulo}</h4>
            <dl>
              {s.items.map(([k, v]) => (
                <div className="formula-row" key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
