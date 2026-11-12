export type Matrix = number[][];
export type Cell = number | string;

export const rows = (m: Matrix) => m.length;
export const cols = (m: Matrix) => m[0]?.length ?? 0;

export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i]![j]!));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v - b[i]![j]!));
}

export function scale(k: number, a: Matrix): Matrix {
  return a.map((row) => row.map((v) => k * v));
}

export function transpose(a: Matrix): Matrix {
  return Array.from({ length: cols(a) }, (_, j) => a.map((row) => row[j]!));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  if (cols(a) !== rows(b)) throw new Error("Ordo tidak cocok untuk perkalian");
  return a.map((row) =>
    Array.from({ length: cols(b) }, (_, j) => row.reduce((sum, v, k) => sum + v * b[k]![j]!, 0)),
  );
}

export function elementwise(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v * b[i]![j]!));
}

export function det(a: Matrix): number {
  const n = rows(a);
  if (n !== cols(a)) throw new Error("Determinan hanya untuk matriks persegi");
  if (n === 1) return a[0]![0]!;
  if (n === 2) return a[0]![0]! * a[1]![1]! - a[0]![1]! * a[1]![0]!;
  if (n === 3) {
    const [[p, q, r], [s, t, u], [v, w, x]] = a as [[number, number, number], [number, number, number], [number, number, number]];
    return p * t * x + q * u * v + r * s * w - r * t * v - p * u * w - q * s * x;
  }
  throw new Error("Determinan hanya didukung sampai ordo 3");
}

/** Inverse of a 2×2 matrix whose determinant is ±1 (stays integer). Returns null if singular. */
export function inverse2(a: Matrix): Matrix | null {
  const d = det(a);
  if (d === 0) return null;
  const [[p, q], [r, s]] = a as [[number, number], [number, number]];
  return [
    [s / d, -q / d],
    [-r / d, p / d],
  ].map((row) => row.map((v) => (Object.is(v, -0) ? 0 : v)));
}

export const identity = (n: number): Matrix =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export function equals(a: Matrix, b: Matrix): boolean {
  return (
    rows(a) === rows(b) &&
    cols(a) === cols(b) &&
    a.every((row, i) => row.every((v, j) => v === b[i]![j]))
  );
}

export const matrixKey = (m: Cell[][]) => m.map((r) => r.join(",")).join(";");

/** Format numbers with a real minus sign for friendlier reading. */
export function formatCell(v: Cell): string {
  if (typeof v === "string") return v;
  const n = Object.is(v, -0) ? 0 : v;
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

const SUB = "₀₁₂₃₄₅₆₇₈₉";
export const subscript = (n: number | string) =>
  String(n)
    .split("")
    .map((ch) => (/[0-9]/.test(ch) ? SUB[Number(ch)] : ch))
    .join("");
