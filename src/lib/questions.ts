import {
  add,
  det,
  elementwise,
  equals,
  formatCell,
  inverse2,
  matrixKey,
  multiply,
  scale,
  subscript,
  subtract,
  transpose,
  type Cell,
  type Matrix,
} from "./matrix";
import { int, nonZero, pick, randomMatrix, shuffle, type Rng } from "./random";

export type Option = { kind: "text"; text: string } | { kind: "matrix"; m: Matrix };

export type Question = {
  id: string;
  topicId: string;
  prompt: string;
  matrices?: { label?: string; m: Cell[][] }[];
  options: Option[];
  answer: number;
  explanation: string;
};

const optionKey = (o: Option) => (o.kind === "text" ? `t:${o.text}` : `m:${matrixKey(o.m)}`);

function perturb(rng: Rng, m: Matrix): Matrix {
  const out = m.map((r) => [...r]);
  const i = int(rng, 0, out.length - 1);
  const j = int(rng, 0, out[0]!.length - 1);
  out[i]![j]! += nonZero(rng, -3, 3);
  return out;
}

/** Correct option first, then distractors; removes duplicates, fills to 4, shuffles. */
function finalize(
  rng: Rng,
  correct: Option,
  distractors: Option[],
  filler: () => Option,
): { options: Option[]; answer: number } {
  const seen = new Set([optionKey(correct)]);
  const list: Option[] = [correct];
  for (const d of distractors) {
    if (list.length >= 4) break;
    const k = optionKey(d);
    if (!seen.has(k)) {
      seen.add(k);
      list.push(d);
    }
  }
  let guard = 0;
  while (list.length < 4 && guard++ < 50) {
    const d = filler();
    const k = optionKey(d);
    if (!seen.has(k)) {
      seen.add(k);
      list.push(d);
    }
  }
  const options = shuffle(rng, list);
  return { options, answer: options.findIndex((o) => optionKey(o) === optionKey(correct)) };
}

const txt = (text: string | number): Option => ({
  kind: "text",
  text: typeof text === "number" ? formatCell(text) : text,
});
const mat = (m: Matrix): Option => ({ kind: "matrix", m });

const matrixQ = (rng: Rng, correct: Matrix, distractors: Matrix[]) =>
  finalize(rng, mat(correct), distractors.map(mat), () => mat(perturb(rng, correct)));

const numberQ = (rng: Rng, correct: number, distractors: number[], spread = 4) =>
  finalize(rng, txt(correct), distractors.map(txt), () => txt(correct + nonZero(rng, -spread, spread)));

let counter = 0;
const qid = (topic: string) => `${topic}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

type Gen = (rng: Rng) => Omit<Question, "id" | "topicId">;

const ordoText = (r: number, c: number) => `${r} × ${c}`;

/* ---------- Generators per topic ---------- */

const pengenalan: Gen = (rng) => {
  if (rng() < 0.5) {
    let r = int(rng, 1, 4);
    let c = int(rng, 1, 4);
    if (r === 1 && c === 1) c = 3;
    if (r === c) r = r === 4 ? 2 : r + 1;
    const m = randomMatrix(rng, r, c);
    return {
      prompt: "Berapakah ordo matriks A?",
      matrices: [{ label: "A", m }],
      ...finalize(
        rng,
        txt(ordoText(r, c)),
        [txt(ordoText(c, r)), txt(ordoText(r + 1, c)), txt(ordoText(r, c + 1))],
        () => txt(ordoText(int(rng, 1, 5), int(rng, 1, 5))),
      ),
      explanation: `Matriks A memiliki ${r} baris dan ${c} kolom, jadi ordonya ${ordoText(r, c)} (baris dulu, baru kolom).`,
    };
  }
  const values = shuffle(
    rng,
    Array.from({ length: 19 }, (_, k) => k - 9),
  );
  const m: Matrix = [values.slice(0, 3), values.slice(3, 6), values.slice(6, 9)];
  const at = (r: number, c: number) => m[r]![c]!;
  const i = int(rng, 0, 2);
  let j = int(rng, 0, 2);
  if (i === j) j = (j + 1) % 3;
  return {
    prompt: `Nilai elemen a${subscript(`${i + 1}${j + 1}`)} pada matriks A adalah…`,
    matrices: [{ label: "A", m }],
    ...numberQ(rng, at(i, j), [at(j, i), at(i, (j + 1) % 3), at((i + 1) % 3, j)]),
    explanation: `a${subscript(`${i + 1}${j + 1}`)} adalah elemen pada baris ke-${i + 1} dan kolom ke-${j + 1}, yaitu ${formatCell(at(i, j))}.`,
  };
};

const TYPE_NAMES = [
  "Matriks baris",
  "Matriks kolom",
  "Matriks nol",
  "Matriks identitas",
  "Matriks diagonal",
  "Matriks segitiga atas",
  "Matriks segitiga bawah",
] as const;
type TypeName = (typeof TYPE_NAMES)[number];

const ALSO_TRUE: Record<TypeName, TypeName[]> = {
  "Matriks baris": [],
  "Matriks kolom": [],
  "Matriks nol": ["Matriks diagonal", "Matriks segitiga atas", "Matriks segitiga bawah"],
  "Matriks identitas": ["Matriks diagonal", "Matriks segitiga atas", "Matriks segitiga bawah"],
  "Matriks diagonal": ["Matriks segitiga atas", "Matriks segitiga bawah"],
  "Matriks segitiga atas": [],
  "Matriks segitiga bawah": [],
};

const TYPE_REASON: Record<TypeName, string> = {
  "Matriks baris": "hanya memiliki satu baris",
  "Matriks kolom": "hanya memiliki satu kolom",
  "Matriks nol": "semua elemennya bernilai 0",
  "Matriks identitas": "diagonal utamanya 1 dan elemen lainnya 0",
  "Matriks diagonal": "semua elemen di luar diagonal utama bernilai 0",
  "Matriks segitiga atas": "semua elemen di bawah diagonal utama bernilai 0",
  "Matriks segitiga bawah": "semua elemen di atas diagonal utama bernilai 0",
};

function typeMatrix(rng: Rng, t: TypeName): Matrix {
  const n = int(rng, 2, 3);
  const v = () => nonZero(rng, -9, 9);
  switch (t) {
    case "Matriks baris":
      return [Array.from({ length: int(rng, 2, 4) }, v)];
    case "Matriks kolom":
      return Array.from({ length: int(rng, 2, 4) }, () => [v()]);
    case "Matriks nol":
      return Array.from({ length: n }, () => Array(int(rng, n, n)).fill(0));
    case "Matriks identitas":
      return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    case "Matriks diagonal": {
      const m = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? int(rng, 2, 9) : 0)),
      );
      return m;
    }
    case "Matriks segitiga atas":
      return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j >= i ? v() : 0)));
    case "Matriks segitiga bawah":
      return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j <= i ? v() : 0)));
  }
}

const jenis: Gen = (rng) => {
  const t = pick(rng, TYPE_NAMES);
  const m = typeMatrix(rng, t);
  const pool = TYPE_NAMES.filter((n) => n !== t && !ALSO_TRUE[t].includes(n));
  const distractors = shuffle(rng, pool).slice(0, 3).map((n) => txt(n));
  return {
    prompt: "Matriks di bawah ini termasuk jenis…",
    matrices: [{ label: "M", m }],
    ...finalize(rng, txt(t), distractors, () => txt(pick(rng, pool))),
    explanation: `${t}, karena ${TYPE_REASON[t]}.`,
  };
};

const linearTerm = (k: number, p: number, v = "x") => {
  const left = k === 1 ? v : `${k}${v}`;
  if (p === 0) return left;
  return p > 0 ? `${left} + ${p}` : `${left} − ${Math.abs(p)}`;
};

const transposeGen: Gen = (rng) => {
  if (rng() < 0.55) {
    const a = randomMatrix(rng, 2, 3);
    const t = transpose(a);
    const [a0, a1] = a as [number[], number[]];
    const flatWrong: Matrix = [a0.slice(0, 2), [a0[2]!, a1[0]!], a1.slice(1, 3)];
    const reversed = [...t].reverse();
    return {
      prompt: "Transpose dari matriks A (Aᵀ) adalah…",
      matrices: [{ label: "A", m: a }],
      ...matrixQ(rng, t, [flatWrong, reversed, t.map((r) => [...r].reverse())]),
      explanation: "Baris pertama A menjadi kolom pertama Aᵀ, dan baris kedua A menjadi kolom kedua Aᵀ.",
    };
  }
  const x = int(rng, -6, 9);
  const k = pick(rng, [1, 2, 3]);
  const p = int(rng, -5, 5);
  const q = int(rng, -9, 9);
  const r = int(rng, -9, 9);
  const s = int(rng, -9, 9);
  const value = k * x + p;
  return {
    prompt: "Jika kedua matriks berikut sama, nilai x adalah…",
    matrices: [
      { m: [[linearTerm(k, p), q], [r, s]] },
      { m: [[value, q], [r, s]] },
    ],
    ...numberQ(rng, x, [value, x + 1, -x]),
    explanation: `Elemen seletak harus sama: ${linearTerm(k, p)} = ${formatCell(value)}, sehingga x = ${formatCell(x)}.`,
  };
};

const penjumlahan: Gen = (rng) => {
  const a = randomMatrix(rng, 2, 2);
  const b = randomMatrix(rng, 2, 2);
  const plus = rng() < 0.5;
  const correct = plus ? add(a, b) : subtract(a, b);
  return {
    prompt: plus ? "Hasil dari A + B adalah…" : "Hasil dari A − B adalah…",
    matrices: [
      { label: "A", m: a },
      { label: "B", m: b },
    ],
    ...matrixQ(rng, correct, plus ? [subtract(a, b), perturb(rng, correct)] : [subtract(b, a), add(a, b)]),
    explanation: plus
      ? "Jumlahkan elemen-elemen yang seletak: a₁₁ + b₁₁, a₁₂ + b₁₂, dan seterusnya."
      : "Kurangkan elemen-elemen yang seletak: a₁₁ − b₁₁, a₁₂ − b₁₂, dan seterusnya. Ingat, A − B ≠ B − A.",
  };
};

const skalar: Gen = (rng) => {
  const k = pick(rng, [-3, -2, 2, 3, 4, 5]);
  const a = randomMatrix(rng, 2, 2, -6, 6);
  const correct = scale(k, a);
  const firstRowOnly: Matrix = [correct[0]!, a[1]!];
  return {
    prompt: `Hasil dari ${formatCell(k)}A adalah…`,
    matrices: [{ label: "A", m: a }],
    ...matrixQ(rng, correct, [a.map((r) => r.map((v) => v + k)), firstRowOnly, scale(-k, a)]),
    explanation: `Kalikan ${formatCell(k)} ke setiap elemen A, misalnya ${formatCell(k)} × ${formatCell(a[0]![0]!)} = ${formatCell(correct[0]![0]!)}.`,
  };
};

const perkalian: Gen = (rng) => {
  if (rng() < 0.3) {
    const m = int(rng, 1, 4);
    const n = int(rng, 2, 4);
    let p = int(rng, 1, 4);
    if (p === m) p = m === 4 ? 1 : m + 1;
    return {
      prompt: `Matriks A berordo ${ordoText(m, n)} dan B berordo ${ordoText(n, p)}. Ordo matriks AB adalah…`,
      ...finalize(
        rng,
        txt(ordoText(m, p)),
        [txt(ordoText(n, n)), txt(ordoText(p, m)), txt(ordoText(m, n))],
        () => txt(ordoText(int(rng, 1, 5), int(rng, 1, 5))),
      ),
      explanation: `Kolom A (${n}) sama dengan baris B (${n}), jadi bisa dikali. Hasilnya berordo baris A × kolom B = ${ordoText(m, p)}.`,
    };
  }
  const a = randomMatrix(rng, 2, 2, -3, 5);
  const b = randomMatrix(rng, 2, 2, -3, 5);
  const ab = multiply(a, b);
  return {
    prompt: "Hasil dari A · B adalah…",
    matrices: [
      { label: "A", m: a },
      { label: "B", m: b },
    ],
    ...matrixQ(rng, ab, [multiply(b, a), elementwise(a, b), perturb(rng, ab)]),
    explanation: `Gunakan baris × kolom. Contoh: c₁₁ = ${formatCell(a[0]![0]!)}·${formatCell(b[0]![0]!)} + ${formatCell(a[0]![1]!)}·${formatCell(b[1]![0]!)} = ${formatCell(ab[0]![0]!)}.`,
  };
};

const determinan: Gen = (rng) => {
  if (rng() < 0.65) {
    const m = randomMatrix(rng, 2, 2, -6, 9);
    const [[a, b], [c, d]] = m as [[number, number], [number, number]];
    const value = det(m);
    return {
      prompt: "Determinan matriks A adalah…",
      matrices: [{ label: "A", m }],
      ...numberQ(rng, value, [a * d + b * c, b * c - a * d, a * c - b * d], 6),
      explanation: `det A = ad − bc = ${formatCell(a)}·${formatCell(d)} − ${formatCell(b)}·${formatCell(c)} = ${formatCell(a * d)} − ${formatCell(b * c)} = ${formatCell(value)}.`,
    };
  }
  const m = randomMatrix(rng, 3, 3, 0, 4);
  const value = det(m);
  return {
    prompt: "Dengan aturan Sarrus, determinan matriks B adalah…",
    matrices: [{ label: "B", m }],
    ...numberQ(rng, value, [-value, value + nonZero(rng, -5, 5), value + nonZero(rng, -9, 9)], 8),
    explanation: `Jumlah diagonal ke kanan bawah dikurangi jumlah diagonal ke kiri bawah menghasilkan det B = ${formatCell(value)}.`,
  };
};

/** 2×2 matrix with determinant ±1 so its inverse stays an integer matrix. */
function unimodular(rng: Rng): Matrix {
  const k = nonZero(rng, -3, 3);
  const m = nonZero(rng, -2, 2);
  const base: Matrix = [
    [1 + k * m, k],
    [m, 1],
  ];
  const swapped: Matrix = rng() < 0.4 ? [base[1]!, base[0]!] : base;
  return rng() < 0.5 ? swapped : transpose(swapped);
}

const invers: Gen = (rng) => {
  if (rng() < 0.7) {
    const a = unimodular(rng);
    const inv = inverse2(a)!;
    const [[p, q], [r, s]] = a as [[number, number], [number, number]];
    return {
      prompt: "Invers dari matriks A (A⁻¹) adalah…",
      matrices: [{ label: "A", m: a }],
      ...matrixQ(rng, inv, [
        [
          [s, -q],
          [-r, p],
        ],
        [
          [p, -q],
          [-r, s],
        ],
        [
          [s, q],
          [r, p],
        ],
        transpose(inv),
      ]),
      explanation: `det A = ${formatCell(det(a))}. Tukar elemen diagonal utama, ganti tanda diagonal samping, lalu bagi dengan det A.`,
    };
  }
  const x0 = int(rng, 1, 6);
  const b = int(rng, 1, 4);
  const t = int(rng, 2, 3);
  return {
    prompt: "Agar matriks berikut tidak memiliki invers (singular), nilai x adalah…",
    matrices: [{ m: [["x", b], [x0 * t, b * t]] }],
    ...numberQ(rng, x0, [-x0, x0 * t, b * t]),
    explanation: `Matriks singular jika determinannya 0: x·${b * t} − ${b}·${x0 * t} = 0, sehingga x = ${x0}.`,
  };
};

const persamaan: Gen = (rng) => {
  if (rng() < 0.4) {
    const a = randomMatrix(rng, 2, 2);
    const b = randomMatrix(rng, 2, 2);
    const x = subtract(b, a);
    return {
      prompt: "Jika X + A = B, maka matriks X adalah…",
      matrices: [
        { label: "A", m: a },
        { label: "B", m: b },
      ],
      ...matrixQ(rng, x, [add(a, b), subtract(a, b), perturb(rng, x)]),
      explanation: "Pindahkan A ke ruas kanan: X = B − A, lalu kurangkan elemen seletak.",
    };
  }
  const a = unimodular(rng);
  const inv = inverse2(a)!;
  let x = randomMatrix(rng, 2, 2, -3, 4);
  let b = multiply(a, x);
  let guard = 0;
  while (equals(multiply(b, inv), x) && guard++ < 10) {
    x = randomMatrix(rng, 2, 2, -3, 4);
    b = multiply(a, x);
  }
  return {
    prompt: "Jika A · X = B, maka matriks X adalah…",
    matrices: [
      { label: "A", m: a },
      { label: "B", m: b },
    ],
    ...matrixQ(rng, x, [multiply(b, inv), subtract(b, a), perturb(rng, x)]),
    explanation: `Karena A · X = B, maka X = A⁻¹ · B (A⁻¹ di sebelah kiri). Di sini A⁻¹ = [${inv.map((r) => r.map(formatCell).join("  ")).join(" ; ")}].`,
  };
};

export const GENERATORS: Record<string, Gen> = {
  pengenalan,
  jenis,
  transpose: transposeGen,
  penjumlahan,
  skalar,
  perkalian,
  determinan,
  invers,
  persamaan,
};

export function generateQuestion(topicId: string, rng: Rng = Math.random): Question {
  const gen = GENERATORS[topicId];
  if (!gen) throw new Error(`Topik tidak dikenal: ${topicId}`);
  return { id: qid(topicId), topicId, ...gen(rng) };
}

export const PRACTICE_LENGTH = 5;

export function generatePractice(topicId: string, rng: Rng = Math.random): Question[] {
  return Array.from({ length: PRACTICE_LENGTH }, () => generateQuestion(topicId, rng));
}

/** Evaluation mixes every topic, harder topics appear twice. */
export const EVALUATION_PLAN = [
  "pengenalan",
  "jenis",
  "transpose",
  "penjumlahan",
  "penjumlahan",
  "skalar",
  "perkalian",
  "perkalian",
  "determinan",
  "determinan",
  "invers",
  "invers",
  "persamaan",
  "persamaan",
  "transpose",
] as const;

export const EVALUATION_TIME_SECONDS = 20 * 60;
export const PASSING_SCORE = 75;

export function generateEvaluation(rng: Rng = Math.random): Question[] {
  return EVALUATION_PLAN.map((t) => generateQuestion(t, rng));
}
