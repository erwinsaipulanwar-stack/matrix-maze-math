export type Tone = "coral" | "sunny" | "teal" | "sky";

export const AVATARS = [
  { id: "fox", emoji: "🦊", name: "Rubah", tone: "coral" },
  { id: "panda", emoji: "🐼", name: "Panda", tone: "teal" },
  { id: "tiger", emoji: "🐯", name: "Harimau", tone: "sunny" },
  { id: "frog", emoji: "🐸", name: "Katak", tone: "teal" },
  { id: "octopus", emoji: "🐙", name: "Gurita", tone: "coral" },
  { id: "unicorn", emoji: "🦄", name: "Unicorn", tone: "sky" },
  { id: "koala", emoji: "🐨", name: "Koala", tone: "sky" },
  { id: "penguin", emoji: "🐧", name: "Penguin", tone: "sky" },
  { id: "owl", emoji: "🦉", name: "Burung Hantu", tone: "sunny" },
  { id: "cat", emoji: "🐱", name: "Kucing", tone: "sunny" },
  { id: "bunny", emoji: "🐰", name: "Kelinci", tone: "coral" },
  { id: "dino", emoji: "🦖", name: "Dino", tone: "teal" },
] as const satisfies readonly { id: string; emoji: string; name: string; tone: Tone }[];

export type AvatarId = (typeof AVATARS)[number]["id"];

export const getAvatar = (id: string | null | undefined) =>
  AVATARS.find((a) => a.id === id) ?? AVATARS[0];

export const TONE_SOFT_BG: Record<Tone, string> = {
  coral: "bg-coral-soft",
  sunny: "bg-sunny-soft",
  teal: "bg-teal-soft",
  sky: "bg-sky-soft",
};

export const TONE_BG: Record<Tone, string> = {
  coral: "bg-coral",
  sunny: "bg-sunny",
  teal: "bg-teal",
  sky: "bg-sky",
};

export const TONE_TEXT: Record<Tone, string> = {
  coral: "text-coral-shade",
  sunny: "text-sunny-shade",
  teal: "text-teal-shade",
  sky: "text-sky-shade",
};
