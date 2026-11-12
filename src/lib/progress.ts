import { LESSONS } from "./lessons";

export const LESSON_POINTS = 20;
export const PRACTICE_POINTS_PER_CORRECT = 5;
export const EVALUATION_POINTS_PER_CORRECT = 10;

export const LEVELS = [
  { name: "Pemula Matriks", min: 0, emoji: "🌱" },
  { name: "Penjelajah Angka", min: 150, emoji: "🧭" },
  { name: "Jagoan Matriks", min: 400, emoji: "⚡" },
  { name: "Master Mahtrix", min: 800, emoji: "👑" },
] as const;

export type ActivityData = {
  lessons: { lesson_id: string }[];
  practice: { topic_id: string; correct: number; total: number }[];
  evaluations: { correct: number; total: number; score: number }[];
};

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  unlocked: boolean;
};

export function computePoints(data: ActivityData): number {
  const lessonIds = new Set(data.lessons.map((l) => l.lesson_id));
  const lessons = lessonIds.size * LESSON_POINTS;
  const practice = data.practice.reduce((s, p) => s + p.correct * PRACTICE_POINTS_PER_CORRECT, 0);
  const evals = data.evaluations.reduce((s, e) => s + e.correct * EVALUATION_POINTS_PER_CORRECT, 0);
  return lessons + practice + evals;
}

export function levelFor(points: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.min) idx = i;
  });
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1] as (typeof LEVELS)[number] | undefined;
  const progress = next ? Math.round(((points - current.min) / (next.min - current.min)) * 100) : 100;
  return { ...current, index: idx, next, progress };
}

export function computeBadges(data: ActivityData, points = computePoints(data)): Badge[] {
  const lessonIds = new Set(data.lessons.map((l) => l.lesson_id));
  const topics = new Set(data.practice.map((p) => p.topic_id));
  const bestEval = Math.max(0, ...data.evaluations.map((e) => e.score));
  return [
    {
      id: "langkah-pertama",
      name: "Langkah Pertama",
      emoji: "🐣",
      desc: "Selesaikan 1 materi",
      unlocked: lessonIds.size >= 1,
    },
    {
      id: "kutu-buku",
      name: "Kutu Buku",
      emoji: "📚",
      desc: `Selesaikan semua ${LESSONS.length} materi`,
      unlocked: LESSONS.every((l) => lessonIds.has(l.id)),
    },
    {
      id: "rajin-latihan",
      name: "Rajin Latihan",
      emoji: "💪",
      desc: "Kerjakan 5 sesi latihan",
      unlocked: data.practice.length >= 5,
    },
    {
      id: "tepat-sasaran",
      name: "Tepat Sasaran",
      emoji: "🎯",
      desc: "Benar semua dalam 1 sesi latihan",
      unlocked: data.practice.some((p) => p.total > 0 && p.correct === p.total),
    },
    {
      id: "penjelajah-topik",
      name: "Penjelajah Topik",
      emoji: "🗺️",
      desc: "Latihan di semua topik",
      unlocked: LESSONS.every((l) => topics.has(l.id)),
    },
    {
      id: "lulus-evaluasi",
      name: "Lulus Evaluasi",
      emoji: "🏅",
      desc: "Nilai evaluasi minimal 75",
      unlocked: bestEval >= 75,
    },
    {
      id: "juara",
      name: "Juara Sempurna",
      emoji: "🏆",
      desc: "Nilai evaluasi 100",
      unlocked: bestEval === 100,
    },
    {
      id: "bintang-500",
      name: "Bintang 500",
      emoji: "⭐",
      desc: "Kumpulkan 500 poin",
      unlocked: points >= 500,
    },
  ];
}

export const scoreFrom = (correct: number, total: number) =>
  total === 0 ? 0 : Math.round((correct / total) * 100);
