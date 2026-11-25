/* Ejercicios de probabilidad por niveles de dificultad. Sin React: se puede testear con node.
   Cada plantilla recibe un generador aleatorio (semilla → mismo ejercicio) y devuelve:
   { tema, text, idea, steps[], num, den, p } con la respuesta como fracción num/den. */
import { mulberry32, pick, randInt, frac, fracStr, comb, varSin, fact, fmt } from "./prob.js";

export const LEVELS = [
  { id: 1, name: "Nivel 1 · Básico", desc: "Regla de Laplace, complemento y experimentos simples." },
  { id: 2, name: "Nivel 2 · Intermedio", desc: "Unión de sucesos, dos dados, extracciones sin reposición, independencia." },
  { id: 3, name: "Nivel 3 · Avanzado", desc: "Combinatoria dentro de la probabilidad, «al menos uno», condicional con casos." },
  { id: 4, name: "Nivel 4 · Desafío", desc: "Probabilidad total, Bayes, arreglos en fila y problemas de varios pasos." },
];

const pct = (n) => `${n} %`;
const dec = (f) => fmt(f.num / f.den, 4);
const pairStr = (a, b) => `(${a},${b})`;

/* ---------------- Nivel 1 ---------------- */
const BARAJA = [
  ["un as", 4, "hay un as por cada palo y son 4 palos"],
  ["una carta de copas", 10, "cada palo tiene 10 cartas"],
  ["una figura (sota, caballo o rey)", 12, "hay 3 figuras por palo y 4 palos: 3 · 4 = 12"],
  ["un siete", 4, "hay un siete por cada palo"],
  ["una carta de espadas", 10, "cada palo tiene 10 cartas"],
];

function n1Baraja(rnd) {
  const [label, n, why] = pick(rnd, BARAJA);
  const f = frac(n, 40);
  return {
    tema: "Laplace con un mazo de cartas",
    text: `Se saca una carta al azar de un mazo español de 40 cartas (oros, copas, espadas y bastos, 10 cartas por palo). ¿Cuál es la probabilidad de sacar ${label}?`,
    idea: "Todas las cartas tienen la misma chance de salir: usá la regla de Laplace, casos favorables sobre casos posibles.",
    steps: [
      "Casos posibles: el mazo tiene 40 cartas → #E = 40.",
      `Casos favorables: ${why} → #A = ${n}.`,
      `P(A) = #A / #E = ${n}/40${f.den !== 40 ? ` = ${fracStr(f)}` : ""}.`,
    ],
    ...f, p: { n },
  };
}

function n1Complemento(rnd) {
  const r = randInt(rnd, 2, 6), a = randInt(rnd, 2, 6), v = randInt(rnd, 2, 6), N = r + a + v;
  const f = frac(N - r, N);
  return {
    tema: "Complemento",
    text: `Una urna tiene ${r} bolitas rojas, ${a} azules y ${v} verdes. Se extrae una al azar. ¿Cuál es la probabilidad de que NO sea roja?`,
    idea: "«No roja» es el complemento de «roja»: P(Aᶜ) = 1 − P(A). También podés contar directamente las que no son rojas.",
    steps: [
      `Total de bolitas: ${r} + ${a} + ${v} = ${N}.`,
      `P(roja) = ${r}/${N}.`,
      `P(no roja) = 1 − ${r}/${N} = ${N - r}/${N}${f.den !== N ? ` = ${fracStr(f)}` : ""}.`,
      `Control contando: las que no son rojas son ${a} + ${v} = ${a + v}, y ${a + v}/${N} da lo mismo.`,
    ],
    ...f, p: { r, a, v },
  };
}

function n1Moneda(rnd) {
  const n = randInt(rnd, 2, 4);
  const palabra = ["", "", "dos", "tres", "cuatro"][n];
  const total = 2 ** n;
  return {
    tema: "Experimento con monedas",
    text: `Se lanza una moneda equilibrada ${palabra} veces. ¿Cuál es la probabilidad de que salga cara en todos los lanzamientos?`,
    idea: "Contá cuántos resultados posibles tiene el experimento completo (cada lanzamiento multiplica por 2) y cuántos sirven.",
    steps: [
      `Cada lanzamiento tiene 2 resultados, así que el experimento tiene ${Array(n).fill(2).join(" · ")} = ${total} resultados posibles → #E = ${total}.`,
      `Solo una secuencia sirve: ${Array(n).fill("C").join("-")} → #A = 1.`,
      `P = 1/${total}.`,
      `Otra forma: como los lanzamientos son independientes, (1/2)${n === 2 ? "²" : n === 3 ? "³" : "⁴"} = 1/${total}.`,
    ],
    num: 1, den: total, p: { n },
  };
}

/* ---------------- Nivel 2 ---------------- */
const UNIONES = [
  ["una carta de copas", 10, "un as", 4, 1, "el as de copas"],
  ["una carta de espadas", 10, "una figura", 12, 3, "las 3 figuras de espadas"],
  ["una carta de oros", 10, "un siete", 4, 1, "el siete de oros"],
  ["una figura", 12, "un as", 4, 0, ""],
  ["una carta de copas", 10, "una carta de oros", 10, 0, ""],
];

function n2Union(rnd) {
  const [A, nA, B, nB, ov, ovTxt] = pick(rnd, UNIONES);
  const tot = nA + nB - ov;
  const f = frac(tot, 40);
  const steps = [
    "Casos posibles: #E = 40.",
    `#A (${A}) = ${nA} y #B (${B}) = ${nB}.`,
  ];
  if (ov > 0) {
    steps.push(`Cumplen las dos cosas a la vez: ${ovTxt} → #(A ∩ B) = ${ov}. Si sumamos ${nA} + ${nB} esas cartas se cuentan dos veces, hay que restarlas una.`);
    steps.push(`P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ${nA}/40 + ${nB}/40 − ${ov}/40 = ${tot}/40${f.den !== 40 ? ` = ${fracStr(f)}` : ""}.`);
  } else {
    steps.push("Ninguna carta cumple las dos cosas a la vez: los sucesos son incompatibles, P(A ∩ B) = 0.");
    steps.push(`P(A ∪ B) = P(A) + P(B) = ${nA}/40 + ${nB}/40 = ${tot}/40${f.den !== 40 ? ` = ${fracStr(f)}` : ""}.`);
  }
  return {
    tema: "Unión de sucesos",
    text: `Se saca una carta al azar de un mazo español de 40 cartas. ¿Cuál es la probabilidad de sacar ${A} o ${B}?`,
    idea: "La «o» pide la unión. Fijate si los sucesos comparten casos: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
    steps, ...f, p: { nA, nB, ov },
  };
}

const formas = (k) => 6 - Math.abs(k - 7); // formas de sumar k con dos dados

function n2Dados(rnd) {
  const mayor = rnd() < 0.5;
  const s = mayor ? randInt(rnd, 8, 10) : randInt(rnd, 4, 6);
  const sums = mayor ? Array.from({ length: 13 - s }, (_, i) => s + i) : Array.from({ length: s - 2 }, (_, i) => 2 + i);
  const total = sums.reduce((acc, k) => acc + formas(k), 0);
  const f = frac(total, 36);
  return {
    tema: "Dos dados",
    text: `Se tiran dos dados. ¿Cuál es la probabilidad de que la suma sea ${mayor ? `mayor o igual que ${s}` : `menor que ${s}`}?`,
    idea: "Los pares ordenados (dado 1, dado 2) son igualmente probables. Contá de a una cuántas formas hay de lograr cada suma.",
    steps: [
      "Cada dado tiene 6 caras: #E = 6 · 6 = 36 pares ordenados.",
      `Las sumas que sirven son ${sums.join(", ")}.`,
      ...sums.map((k) => {
        const lista = [];
        for (let a = 1; a <= 6; a++) if (k - a >= 1 && k - a <= 6) lista.push(pairStr(a, k - a));
        return `Suma ${k}: ${lista.join(" ")} → ${formas(k)} ${formas(k) === 1 ? "forma" : "formas"}.`;
      }),
      `#A = ${sums.map(formas).join(" + ")} = ${total}.`,
      `P = ${total}/36${f.den !== 36 ? ` = ${fracStr(f)}` : ""}.`,
    ],
    ...f, p: { mayor, s },
  };
}

function n2SinReposicion(rnd) {
  const r = randInt(rnd, 3, 6), a = randInt(rnd, 2, 5), N = r + a;
  const f = frac(r * (r - 1), N * (N - 1));
  return {
    tema: "Extracción sin reposición",
    text: `Una urna tiene ${r} bolitas rojas y ${a} azules. Se extraen dos bolitas, una después de la otra y sin reponer la primera. ¿Cuál es la probabilidad de que las dos sean rojas?`,
    idea: "Sin reposición, la urna cambia después de la primera extracción: la segunda probabilidad se calcula con una bolita menos.",
    steps: [
      `Primera extracción: hay ${N} bolitas y ${r} son rojas → P(1.ª roja) = ${r}/${N}.`,
      `Si la primera fue roja, quedan ${N - 1} bolitas y ${r - 1} rojas → P(2.ª roja | 1.ª roja) = ${r - 1}/${N - 1}.`,
      `Se multiplican (rama del árbol): ${r}/${N} · ${r - 1}/${N - 1} = ${r * (r - 1)}/${N * (N - 1)}${f.den !== N * (N - 1) ? ` = ${fracStr(f)}` : ""}.`,
      `Con combinatoria da igual: C(${r},2) / C(${N},2) = ${comb(r, 2)}/${comb(N, 2)}.`,
    ],
    ...f, p: { r, a },
  };
}

const PAREJAS = [["Ana", "Bruno"], ["Lucía", "Mateo"], ["Sofía", "Tomás"], ["Valentina", "Joaquín"]];

function n2Independientes(rnd) {
  const [x, y] = pick(rnd, PAREJAS);
  const a = randInt(rnd, 3, 8), b = randInt(rnd, 3, 8);
  const f = frac(10 * a + 10 * b - a * b, 100);
  const pa = a / 10, pb = b / 10;
  return {
    tema: "Sucesos independientes",
    text: `${x} y ${y} patean un penal cada uno, sin influirse entre sí. ${x} lo convierte con probabilidad ${fmt(pa, 1)} y ${y} con probabilidad ${fmt(pb, 1)}. ¿Cuál es la probabilidad de que al menos uno convierta?`,
    idea: "«Al menos uno» se puede calcular como unión o como 1 − P(ninguno). Si son independientes, P(A ∩ B) = P(A) · P(B).",
    steps: [
      `P(${x}) = ${fmt(pa, 1)} y P(${y}) = ${fmt(pb, 1)}.`,
      `Independientes: P(los dos convierten) = ${fmt(pa, 1)} · ${fmt(pb, 1)} = ${fmt(pa * pb, 2)}.`,
      `Por unión: P(al menos uno) = ${fmt(pa, 1)} + ${fmt(pb, 1)} − ${fmt(pa * pb, 2)} = ${fmt(f.num / f.den, 2)}.`,
      `Por complemento: 1 − P(ninguno) = 1 − ${fmt(1 - pa, 1)} · ${fmt(1 - pb, 1)} = 1 − ${fmt((1 - pa) * (1 - pb), 2)} = ${fmt(f.num / f.den, 2)}. Coinciden.`,
      `En fracción: ${fracStr(f)}.`,
    ],
    ...f, p: { a, b },
  };
}

/* ---------------- Nivel 3 ---------------- */
function n3Comision(rnd) {
  const m = randInt(rnd, 4, 7), w = randInt(rnd, 3, 5), k = randInt(rnd, 3, 4);
  const j = randInt(rnd, 1, k - 1), N = m + w;
  const nE = comb(N, k), nA = comb(w, j) * comb(m, k - j);
  const f = frac(nA, nE);
  return {
    tema: "Combinatoria y probabilidad",
    text: `En un grupo hay ${m} varones y ${w} mujeres. Se elige al azar una comisión de ${k} personas. ¿Cuál es la probabilidad de que tenga exactamente ${j} ${j === 1 ? "mujer" : "mujeres"}?`,
    idea: "El orden en una comisión no importa: usá combinaciones tanto para los casos posibles como para los favorables (elegí por separado mujeres y varones).",
    steps: [
      `Casos posibles: elegir ${k} de ${N} personas → #E = C(${N},${k}) = ${nE}.`,
      `Casos favorables: ${j} ${j === 1 ? "mujer" : "mujeres"} de ${w} y ${k - j} ${k - j === 1 ? "varón" : "varones"} de ${m} → C(${w},${j}) · C(${m},${k - j}) = ${comb(w, j)} · ${comb(m, k - j)} = ${nA}.`,
      `P = ${nA}/${nE}${f.den !== nE ? ` = ${fracStr(f)}` : ""}.`,
    ],
    ...f, p: { m, w, k, j },
  };
}

function n3AlMenosUno(rnd) {
  const dado = rnd() < 0.5;
  if (dado) {
    const n = randInt(rnd, 2, 4);
    const f = frac(6 ** n - 5 ** n, 6 ** n);
    return {
      tema: "«Al menos uno»",
      text: `Se tira un dado ${["", "", "dos", "tres", "cuatro"][n]} veces. ¿Cuál es la probabilidad de obtener al menos un 6?`,
      idea: "«Al menos uno» es el complemento de «ninguno». Calculá P(ningún 6) y restalo de 1.",
      steps: [
        "En un tiro, P(no sale 6) = 5/6.",
        `Los ${n} tiros son independientes: P(ningún 6) = (5/6)^${n} = ${5 ** n}/${6 ** n}.`,
        `P(al menos un 6) = 1 − ${5 ** n}/${6 ** n} = ${6 ** n - 5 ** n}/${6 ** n}${f.den !== 6 ** n ? ` = ${fracStr(f)}` : ""}.`,
        `Contar uno por uno sería largo: habría que sumar «exactamente un 6», «exactamente dos»…`,
      ],
      ...f, p: { dado, n },
    };
  }
  const n = randInt(rnd, 3, 5);
  const f = frac(2 ** n - 1, 2 ** n);
  return {
    tema: "«Al menos uno»",
    text: `Se lanza una moneda equilibrada ${["", "", "", "tres", "cuatro", "cinco"][n]} veces. ¿Cuál es la probabilidad de obtener al menos una cara?`,
    idea: "«Al menos una cara» es el complemento de «ninguna cara» (todas cecas).",
    steps: [
      `Hay 2^${n} = ${2 ** n} resultados posibles.`,
      `Solo uno no tiene ninguna cara: ${Array(n).fill("S").join("-")} → P(ninguna cara) = 1/${2 ** n}.`,
      `P(al menos una cara) = 1 − 1/${2 ** n} = ${2 ** n - 1}/${2 ** n}.`,
    ],
    ...f, p: { dado, n },
  };
}

function n3Codigo(rnd) {
  const k = randInt(rnd, 3, 4);
  const nA = varSin(10, k), nE = 10 ** k;
  const f = frac(nA, nE);
  return {
    tema: "Variaciones y probabilidad",
    text: `Un candado tiene un código de ${k} dígitos (cada dígito va de 0 a 9 y pueden repetirse). Si se elige un código al azar, ¿cuál es la probabilidad de que todos los dígitos sean distintos?`,
    idea: "Para los casos posibles el orden importa y se puede repetir (variaciones con repetición); para los favorables no se repite (variaciones sin repetición).",
    steps: [
      `Casos posibles: ${Array(k).fill(10).join(" · ")} = 10^${k} = ${nE}.`,
      `Casos favorables (todos distintos): ${Array.from({ length: k }, (_, i) => 10 - i).join(" · ")} = ${nA}.`,
      `P = ${nA}/${nE}${f.den !== nE ? ` = ${fracStr(f)}` : ""}.`,
    ],
    ...f, p: { k },
  };
}

function n3CondicionalDados(rnd) {
  const k = randInt(rnd, 5, 6), s = randInt(rnd, 8, 10);
  const B = [], AB = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    if (a === k || b === k) { B.push(pairStr(a, b)); if (a + b >= s) AB.push(pairStr(a, b)); }
  }
  const f = frac(AB.length, B.length);
  return {
    tema: "Probabilidad condicional con casos",
    text: `Se tiran dos dados y se sabe que en al menos uno salió un ${k}. ¿Cuál es la probabilidad de que la suma sea mayor o igual que ${s}?`,
    idea: "Saber que ocurrió B achica el universo a los casos de B. Listá esos casos y buscá cuántos cumplen también A: P(A | B) = #(A ∩ B) / #B.",
    steps: [
      `B = «al menos un ${k}». Casos: ${B.join(" ")} → #B = ${B.length}.`,
      `De esos, los que suman ${s} o más: ${AB.join(" ")} → #(A ∩ B) = ${AB.length}.`,
      `P(A | B) = #(A ∩ B) / #B = ${AB.length}/${B.length}${f.den !== B.length ? ` = ${fracStr(f)}` : ""}.`,
      `Con la fórmula: P(A ∩ B) / P(B) = (${AB.length}/36) / (${B.length}/36) = ${AB.length}/${B.length}.`,
    ],
    ...f, p: { k, s },
  };
}

/* ---------------- Nivel 4 ---------------- */
const REPARTOS = [[50, 30, 20], [40, 35, 25], [60, 30, 10], [50, 25, 25]];
const MAQ = ["A", "B", "C"];

function escenarioFabrica(rnd) {
  const share = pick(rnd, REPARTOS);
  const d = [randInt(rnd, 1, 6), randInt(rnd, 1, 6), randInt(rnd, 1, 6)];
  const prod = share.map((s, i) => s * d[i]);
  const totalNum = prod.reduce((a, b) => a + b, 0);
  const intro = `En una fábrica, la máquina A produce el ${pct(share[0])} de las piezas, la B el ${pct(share[1])} y la C el ${pct(share[2])}. Son defectuosas el ${pct(d[0])} de las piezas de A, el ${pct(d[1])} de las de B y el ${pct(d[2])} de las de C.`;
  const rama = MAQ.map((m, i) => `${m}: P(${m}) · P(D | ${m}) = ${share[i]}/100 · ${d[i]}/100 = ${prod[i]}/10000`);
  return { share, d, prod, totalNum, intro, rama };
}

function n4Total(rnd) {
  const e = escenarioFabrica(rnd);
  const f = frac(e.totalNum, 10000);
  return {
    tema: "Probabilidad total",
    text: `${e.intro} Se elige una pieza al azar. ¿Cuál es la probabilidad de que sea defectuosa?`,
    idea: "Dibujá un árbol: primero la máquina, después defectuosa o no. Una pieza defectuosa puede venir de cualquiera de las tres ramas: sumá las ramas que terminan en D.",
    steps: [
      "Armamos las tres ramas que terminan en «defectuosa» (D):",
      ...e.rama,
      `Sumamos: P(D) = ${e.prod.join(" + ")} = ${e.totalNum}/10000${f.den !== 10000 ? ` = ${fracStr(f)}` : ""}.`,
      `Eso es ${fmt(e.totalNum / 100, 2)} % de piezas defectuosas en total.`,
    ],
    ...f, p: { share: e.share, d: e.d },
  };
}

function n4Bayes(rnd) {
  const e = escenarioFabrica(rnd);
  const i = randInt(rnd, 0, 2), m = MAQ[i];
  const f = frac(e.prod[i], e.totalNum);
  return {
    tema: "Teorema de Bayes",
    text: `${e.intro} Se elige una pieza al azar y resulta defectuosa. ¿Cuál es la probabilidad de que provenga de la máquina ${m}?`,
    idea: "Es una probabilidad condicional «al revés»: P(máquina | defectuosa) = P(máquina ∩ defectuosa) / P(defectuosa). Calculá el denominador con la probabilidad total.",
    steps: [
      "Ramas que terminan en defectuosa (D):",
      ...e.rama,
      `P(D) = ${e.prod.join(" + ")} = ${e.totalNum}/10000.`,
      `Nos piden P(${m} | D) = P(${m} ∩ D) / P(D) = (${e.prod[i]}/10000) / (${e.totalNum}/10000) = ${e.prod[i]}/${e.totalNum}${f.den !== e.totalNum ? ` = ${fracStr(f)}` : ""}.`,
      `La máquina ${m} produce el ${pct(e.share[i])} de las piezas, pero entre las defectuosas aporta el ${fmt((100 * e.prod[i]) / e.totalNum, 1)} %.`,
    ],
    ...f, p: { share: e.share, d: e.d, i },
  };
}

function n4Fila(rnd) {
  const n = randInt(rnd, 5, 7);
  const f = frac(2 * fact(n - 1), fact(n));
  return {
    tema: "Permutaciones y probabilidad",
    text: `${n} personas, entre ellas Ana y Bruno, se ubican al azar en una fila de ${n} asientos. ¿Cuál es la probabilidad de que Ana y Bruno queden sentados uno al lado del otro?`,
    idea: "Contá todas las filas posibles (permutaciones) y las favorables pegando a Ana y Bruno como si fueran un solo bloque; no te olvides de que el bloque se puede dar vuelta.",
    steps: [
      `Casos posibles: ordenar las ${n} personas → #E = ${n}! = ${fact(n)}.`,
      `Casos favorables: tratamos a Ana y Bruno como un bloque. Entonces hay ${n - 1} «objetos» para ordenar → ${n - 1}! = ${fact(n - 1)} formas.`,
      `Dentro del bloque pueden ir Ana-Bruno o Bruno-Ana → 2 formas. #A = 2 · ${fact(n - 1)} = ${2 * fact(n - 1)}.`,
      `P = ${2 * fact(n - 1)}/${fact(n)} = ${fracStr(f)}.`,
    ],
    ...f, p: { n },
  };
}

function n4TresBolitas(rnd) {
  const r = randInt(rnd, 3, 5), a = randInt(rnd, 3, 5), N = r + a;
  const nA = comb(r, 3) + comb(a, 3), nE = comb(N, 3);
  const f = frac(nA, nE);
  return {
    tema: "Combinatoria y probabilidad",
    text: `Una urna tiene ${r} bolitas rojas y ${a} azules. Se sacan 3 bolitas a la vez, sin reposición. ¿Cuál es la probabilidad de que las tres sean del mismo color?`,
    idea: "Sacar de a la vez significa que el orden no importa: combinaciones. «Mismo color» son dos casos incompatibles (3 rojas o 3 azules) que se suman.",
    steps: [
      `Casos posibles: C(${N},3) = ${nE}.`,
      `Tres rojas: C(${r},3) = ${comb(r, 3)}. Tres azules: C(${a},3) = ${comb(a, 3)}.`,
      `Son sucesos incompatibles, se suman: #A = ${comb(r, 3)} + ${comb(a, 3)} = ${nA}.`,
      `P = ${nA}/${nE}${f.den !== nE ? ` = ${fracStr(f)}` : ""}.`,
    ],
    ...f, p: { r, a },
  };
}

function n4Despeje(rnd) {
  const x = randInt(rnd, 5, 10), y = randInt(rnd, 5, 10), o = randInt(rnd, 2, Math.min(x, y, 5));
  const z = x + y - o;
  const f = frac(o, y);
  const d = (k) => fmt(k / 20, 2);
  return {
    tema: "Despejar con la fórmula de la unión",
    text: `Para dos sucesos A y B se sabe que P(A) = ${d(x)}, P(B) = ${d(y)} y P(A ∪ B) = ${d(z)}. Calculá P(A | B).`,
    idea: "Primero despejá P(A ∩ B) de la fórmula de la unión; después usá la definición de probabilidad condicional.",
    steps: [
      `P(A ∪ B) = P(A) + P(B) − P(A ∩ B), entonces P(A ∩ B) = P(A) + P(B) − P(A ∪ B).`,
      `P(A ∩ B) = ${d(x)} + ${d(y)} − ${d(z)} = ${d(o)}.`,
      `P(A | B) = P(A ∩ B) / P(B) = ${d(o)} / ${d(y)} = ${o}/${y}${f.den !== y ? ` = ${fracStr(f)}` : ""}.`,
      `En decimal: ${dec(f)}.`,
    ],
    ...f, p: { x, y, o },
  };
}

export const TEMPLATES = {
  1: [n1Baraja, n1Complemento, n1Moneda],
  2: [n2Union, n2Dados, n2SinReposicion, n2Independientes],
  3: [n3Comision, n3AlMenosUno, n3Codigo, n3CondicionalDados],
  4: [n4Total, n4Bayes, n4Fila, n4TresBolitas, n4Despeje],
};

/** Ejercicio del nivel dado. Con tIndex se fuerza la plantilla (para los ejemplos resueltos). */
export function makeLevelExercise(level, seed, tIndex) {
  const rnd = mulberry32(seed * 9973 + level * 131 + 17);
  const list = TEMPLATES[level];
  const sorteada = randInt(rnd, 0, list.length - 1); // se consume siempre: así los parámetros no dependen de si se fuerza la plantilla
  const idx = tIndex ?? sorteada;
  const ex = list[idx](rnd);
  return { ...ex, level, tIndex: idx, answer: ex.num / ex.den, show: fracStr({ num: ex.num, den: ex.den }) };
}

/** Los ejemplos resueltos de un nivel: una por plantilla, con semilla fija. */
export const solvedExamples = (level) => TEMPLATES[level].map((_, i) => makeLevelExercise(level, 7, i));

/** Tolerancia: 0,005 en general, más estricta si la respuesta es muy chica. */
export const tolFor = (answer) => Math.min(0.005, answer * 0.02);
