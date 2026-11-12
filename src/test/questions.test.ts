import { describe, expect, it } from "vitest";
import { GENERATORS, generateEvaluation, generateQuestion, PRACTICE_LENGTH, generatePractice } from "@/lib/questions";
import { LESSONS } from "@/lib/lessons";
import { seeded } from "@/lib/random";
import { matrixKey } from "@/lib/matrix";

const key = (o: { kind: string; text?: string; m?: number[][] }) =>
  o.kind === "text" ? `t:${o.text}` : `m:${matrixKey(o.m!)}`;

describe("question generators", () => {
  it("has a generator for every lesson topic", () => {
    for (const l of LESSONS) expect(GENERATORS[l.id]).toBeTypeOf("function");
  });

  it("always produces 4 unique options with a valid answer index", () => {
    const rng = seeded(42);
    for (const topic of Object.keys(GENERATORS)) {
      for (let i = 0; i < 200; i++) {
        const q = generateQuestion(topic, rng);
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map(key)).size).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
      }
    }
  });

  it("practice rounds have 5 questions and evaluations have 15", () => {
    expect(PRACTICE_LENGTH).toBe(5);
    expect(generatePractice("determinan", seeded(1))).toHaveLength(5);
    expect(generateEvaluation(seeded(2))).toHaveLength(15);
  });
});
