import { describe, expect, it } from "vitest";
import { computeBadges, computePoints, levelFor, scoreFrom } from "@/lib/progress";
import { LESSONS } from "@/lib/lessons";

const empty = { lessons: [], practice: [], evaluations: [] };

describe("points", () => {
  it("gives 20 per finished lesson (counted once), 5 per correct practice answer, 10 per correct evaluation answer", () => {
    const points = computePoints({
      lessons: [{ lesson_id: "pengenalan" }, { lesson_id: "pengenalan" }, { lesson_id: "jenis" }],
      practice: [{ topic_id: "jenis", correct: 4, total: 5 }],
      evaluations: [{ correct: 12, total: 15, score: 80 }],
    });
    expect(points).toBe(40 + 20 + 120);
  });

  it("levels up at 150, 400 and 800 points", () => {
    expect(levelFor(0).name).toBe("Pemula Matriks");
    expect(levelFor(149).name).toBe("Pemula Matriks");
    expect(levelFor(150).name).toBe("Penjelajah Angka");
    expect(levelFor(400).name).toBe("Jagoan Matriks");
    expect(levelFor(800).name).toBe("Master Mahtrix");
  });

  it("rounds evaluation score to a 0-100 scale", () => {
    expect(scoreFrom(12, 15)).toBe(80);
    expect(scoreFrom(11, 15)).toBe(73);
  });
});

describe("badges", () => {
  const unlocked = (data: Parameters<typeof computeBadges>[0]) =>
    computeBadges(data).filter((b) => b.unlocked).map((b) => b.id);

  it("starts with no badges", () => {
    expect(unlocked(empty)).toEqual([]);
  });

  it("unlocks evaluation badges at score 75 and 100", () => {
    expect(unlocked({ ...empty, evaluations: [{ correct: 11, total: 15, score: 74 }] })).not.toContain("lulus-evaluasi");
    expect(unlocked({ ...empty, evaluations: [{ correct: 12, total: 15, score: 75 }] })).toContain("lulus-evaluasi");
    expect(unlocked({ ...empty, evaluations: [{ correct: 15, total: 15, score: 100 }] })).toContain("juara");
  });

  it("unlocks Kutu Buku only after every lesson is finished", () => {
    const all = LESSONS.map((l) => ({ lesson_id: l.id }));
    expect(unlocked({ ...empty, lessons: all.slice(1) })).not.toContain("kutu-buku");
    expect(unlocked({ ...empty, lessons: all })).toContain("kutu-buku");
  });

  it("unlocks Rajin Latihan after 5 practice sessions", () => {
    const s = { topic_id: "jenis", correct: 1, total: 5 };
    expect(unlocked({ ...empty, practice: [s, s, s, s] })).not.toContain("rajin-latihan");
    expect(unlocked({ ...empty, practice: [s, s, s, s, s] })).toContain("rajin-latihan");
  });
});
