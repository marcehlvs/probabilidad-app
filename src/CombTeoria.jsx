import { useState } from "react";
import { MeasureCard } from "./ui.jsx";
import { TIPOS, perm, permRep, varSin, varCon, comb, listCases } from "./prob.js";

/* Explicación de cada agrupamiento. Los resultados se calculan con prob.js,
   así lo que se muestra siempre coincide con las fórmulas de la guía y la práctica. */

const TEORIA = {
  perm: {
    formula: "Pₙ = n!",
    frase: "Se ordenan TODOS los elementos, y todos son distintos. Un resultado se diferencia de otro solo por el orden.",
    preguntas: "¿Se usan todos? Sí · ¿Hay repetidos? No.",
    porque: "Hay n lugares. Para el primero tenés n opciones, para el segundo quedan n−1, para el tercero n−2… hasta 1. Se multiplican: n · (n−1) · … · 1 = n!",
    ejemplo: { texto: "¿De cuántas formas pueden hacer fila 5 amigos?", pasos: `5 lugares: 5 · 4 · 3 · 2 · 1 = 5! = ${perm(5)}` },
    ojo: "Si dos elementos fueran iguales, intercambiarlos no cambia nada: eso ya es una permutación con repetición.",
    demo: { texto: "Todas las formas de ordenar A, B y C:", type: "perm", items: ["A", "B", "C"], total: perm(3), cuenta: "3! = 6" },
  },
  permRep: {
    formula: "Pₙ^(a,b,…) = n! / (a!·b!·…)",
    frase: "Se ordenan TODOS los elementos, pero algunos son iguales. Cambiar de lugar dos iguales no genera un resultado nuevo.",
    preguntas: "¿Se usan todos? Sí · ¿Hay repetidos (iguales)? Sí. Típico: anagramas.",
    porque: "Primero se cuenta como si todos fueran distintos (n!). Pero así cada resultado quedó contado de más: una vez por cada forma de reordenar los iguales (a!, b!…). Por eso se divide.",
    ejemplo: { texto: "¿Cuántos anagramas tiene la palabra ANANA?", pasos: `5 letras; la A se repite 3 veces y la N 2 veces → 5! / (3!·2!) = 120 / 12 = ${permRep(5, [3, 2])}` },
    ojo: "No es 'elegir': se usan todas las letras y la cantidad de cada una está fija. No la confundas con variación con repetición.",
    demo: { texto: "Todos los anagramas de AAB (si las tres letras fueran distintas habría 3! = 6, pero las dos A son iguales):", type: "permRep", items: ["A", "A", "B"], total: permRep(3, [2, 1]), cuenta: "3! / 2! = 3" },
  },
  varSin: {
    formula: "V(n,k) = n! / (n−k)!",
    frase: "Se eligen k de n elementos, el orden SÍ importa (cada lugar tiene un rol distinto) y un elemento no puede usarse dos veces.",
    preguntas: "¿Se usan todos? No · ¿Importa el orden? Sí · ¿Se repite? No. Típico: podios, cargos, claves sin repetir.",
    porque: "Para el primer lugar hay n opciones, para el segundo n−1, y así hasta completar k lugares: son k factores. Es n! cortado a los primeros k factores, y eso es n!/(n−k)!",
    ejemplo: { texto: "En una carrera de 8 corredores, ¿cuántos podios (1.º, 2.º y 3.º) son posibles?", pasos: `8 · 7 · 6 = ${varSin(8, 3)}` },
    ojo: "Si k = n, V(n,n) = n!: la permutación simple es un caso particular de la variación.",
    demo: { texto: "Todas las formas de elegir 2 de {A, B, C, D} y ordenarlas:", type: "varSin", items: ["A", "B", "C", "D"], k: 2, total: varSin(4, 2), cuenta: "4 · 3 = 12" },
  },
  varCon: {
    formula: "VR(n,k) = nᵏ",
    frase: "Se eligen k veces entre n opciones, el orden importa, y en cada elección se puede volver a elegir lo mismo (las opciones no se gastan).",
    preguntas: "¿Se usan todos? No · ¿Importa el orden? Sí · ¿Se repite? Sí. Típico: códigos, patentes, tiradas de un dado.",
    porque: "En cada uno de los k lugares tenés siempre las mismas n opciones, sin importar qué elegiste antes. Se multiplica n por sí mismo k veces: n · n · … · n = nᵏ",
    ejemplo: { texto: "¿Cuántos códigos de 4 dígitos (0 a 9) hay?", pasos: `10 · 10 · 10 · 10 = 10⁴ = ${varCon(10, 4)}` },
    ojo: "La diferencia con la variación sin repetición es una sola: acá la cantidad de opciones NO baja en cada lugar.",
    demo: { texto: "Todas las formas de llenar 2 lugares con A, B o C (se puede repetir):", type: "varCon", items: ["A", "B", "C"], k: 2, total: varCon(3, 2), cuenta: "3 · 3 = 9" },
  },
  comb: {
    formula: "C(n,k) = n! / (k!·(n−k)!)",
    frase: "Se eligen k de n elementos y el orden NO importa: solo cuenta QUÉ elementos quedaron elegidos, no en qué orden.",
    preguntas: "¿Se usan todos? No · ¿Importa el orden? No. Típico: comisiones, equipos, manos de cartas.",
    porque: "Si contáramos con orden saldrían V(n,k) casos, pero cada grupo apareció k! veces (una por cada orden posible de sus integrantes). Para contarlo una sola vez se divide por k!.",
    ejemplo: { texto: "De 8 alumnos se elige una comisión de 3 integrantes con la misma función. ¿Cuántas comisiones hay?", pasos: `V(8,3) / 3! = 8·7·6 / 6 = 336 / 6 = ${comb(8, 3)}` },
    ojo: "Prueba rápida: si intercambiás dos elegidos, ¿la situación es la misma? Si sí, es combinación.",
    demo: { texto: "Todos los grupos de 2 que se pueden elegir de {A, B, C, D} (AB y BA son el mismo):", type: "comb", items: ["A", "B", "C", "D"], k: 2, total: comb(4, 2), cuenta: "(4 · 3) / 2! = 6" },
  },
};

const orden = ["perm", "permRep", "varSin", "varCon", "comb"];

function Casos({ demo }) {
  const [ver, setVer] = useState(false);
  const casos = listCases(demo.type, demo.items, demo.k);
  return (
    <div style={{ marginTop: 10 }}>
      <button className="btn btn--ghost" onClick={() => setVer((v) => !v)}>
        {ver ? "ocultar los casos" : "ver todos los casos"}
      </button>
      {ver && (
        <div>
          <p className="teo-p">{demo.texto}</p>
          <div className="raw-data__chips">
            {casos.map((c) => <span className="chip" key={c}>{c}</span>)}
          </div>
          <p className="teo-p"><b>{casos.length} casos</b> — coincide con la fórmula: {demo.cuenta}</p>
        </div>
      )}
    </div>
  );
}

export default function CombTeoria({ initial }) {
  const [open, setOpen] = useState(initial || "perm");
  return (
    <div>
      <h3 className="ex-title">¿En qué consiste cada uno?</h3>
      <p className="eval-note">Tocá cada tipo para ver qué cuenta, por qué funciona la fórmula y un ejemplo resuelto.</p>

      <div className="teo-box">
        <p className="teo-p"><b>Dos ideas para empezar</b></p>
        <p className="teo-p"><b>Principio de multiplicación:</b> si una decisión se toma en pasos, se multiplican las opciones de cada paso. Con 3 remeras y 2 pantalones hay 3 · 2 = 6 conjuntos distintos.</p>
        <p className="teo-p"><b>Factorial:</b> n! = n · (n−1) · … · 2 · 1 (por ejemplo, 4! = 24), y por definición 0! = 1. Es la cantidad de formas de ordenar n elementos distintos.</p>
        <p className="teo-p">Todas las fórmulas de abajo salen de estas dos ideas.</p>
      </div>

      <div className="teo-list">
        {orden.map((k) => {
          const t = TEORIA[k];
          return (
            <MeasureCard key={k} label={TIPOS[k]} value={t.formula} unit="" open={open === k} onToggle={() => setOpen(open === k ? null : k)} formula={t.frase}>
              <p className="teo-p"><b>Cómo reconocerlo:</b> {t.preguntas}</p>
              <p className="teo-p"><b>¿Por qué funciona?</b> {t.porque}</p>
              <p className="teo-p"><b>Ejemplo:</b> {t.ejemplo.texto}<br />{t.ejemplo.pasos}</p>
              <Casos demo={t.demo} />
              <p className="teo-ojo"><b>Ojo:</b> {t.ojo}</p>
            </MeasureCard>
          );
        })}
      </div>

      <div className="teo-box">
        <p className="teo-p"><b>Los pares que más se confunden</b></p>
        <p className="teo-p"><b>Variación vs. combinación.</b> Con los mismos 8 alumnos: un podio de 3 (1.º, 2.º, 3.º) tiene {varSin(8, 3)} formas, y una comisión de 3 sin cargos tiene {comb(8, 3)}. {varSin(8, 3)} = {comb(8, 3)} · 3!: cada comisión da 3! = {perm(3)} podios distintos.</p>
        <p className="teo-p"><b>Variación sin vs. con repetición.</b> Un código de 3 dígitos distintos: 10·9·8 = {varSin(10, 3)}. Si los dígitos pueden repetirse: 10³ = {varCon(10, 3)}.</p>
        <p className="teo-p"><b>Permutación vs. variación.</b> Ordenar los 5 elementos = 5! = {perm(5)}. Elegir y ordenar solo 3 de los 5 = 5·4·3 = {varSin(5, 3)}.</p>
      </div>
    </div>
  );
}
