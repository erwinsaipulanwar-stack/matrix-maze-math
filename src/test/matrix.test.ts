import { describe, expect, it } from "vitest";
import { add, det, inverse2, multiply, scale, subtract, transpose, identity } from "@/lib/matrix";

describe("matrix operations", () => {
  it("adds and subtracts same-order matrices element by element", () => {
    const a = [[2, 3], [1, 4]];
    const b = [[5, -1], [0, 2]];
    expect(add(a, b)).toEqual([[7, 2], [1, 6]]);
    expect(subtract(a, b)).toEqual([[-3, 4], [1, 2]]);
  });

  it("multiplies by a scalar", () => {
    expect(scale(3, [[2, -1], [0, 4]])).toEqual([[6, -3], [0, 12]]);
  });

  it("multiplies two matrices row by column", () => {
    expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
  });

  it("transposes rows into columns", () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
  });

  it("computes 2x2 and 3x3 determinants", () => {
    expect(det([[4, 3], [2, 5]])).toBe(14);
    expect(det([[2, 1, 3], [0, 4, 1], [5, 2, 0]])).toBe(-59);
  });

  it("inverts a 2x2 matrix and returns null when singular", () => {
    const a = [[3, 1], [5, 2]];
    const inv = inverse2(a)!;
    expect(inv).toEqual([[2, -1], [-5, 3]]);
    expect(multiply(a, inv)).toEqual(identity(2));
    expect(inverse2([[1, 2], [2, 4]])).toBeNull();
  });
});
