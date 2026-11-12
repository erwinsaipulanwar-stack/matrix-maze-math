export type Rng = () => number;

/** Small deterministic PRNG (mulberry32) so tests can use fixed seeds. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const nonZero = (rng: Rng, min: number, max: number) => {
  let v = 0;
  while (v === 0) v = int(rng, min, max);
  return v;
};

export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;

export function shuffle<T>(rng: Rng, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const randomMatrix = (rng: Rng, r: number, c: number, min = -9, max = 9) =>
  Array.from({ length: r }, () => Array.from({ length: c }, () => int(rng, min, max)));
