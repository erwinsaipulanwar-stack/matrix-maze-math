import { createFileRoute, Link } from "@tanstack/react-router";
import { useUserData } from "@/hooks/use-user-data";
import { LESSONS } from "@/lib/lessons";
import { TONE_SOFT_BG } from "@/lib/avatars";
import { PageTitle } from "@/components/AppShell";
import { PRACTICE_LENGTH } from "@/lib/questions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/latihan/")({
  head: () => ({
    meta: [
      { title: "Latihan Soal Matriks — Mahtrix" },
      { name: "description", content: "Latihan soal matriks per topik dengan soal baru setiap main dan pembahasan langsung." },
      { property: "og:title", content: "Latihan Soal Matriks — Mahtrix" },
      { property: "og:description", content: "Asah kemampuan matriksmu dengan latihan soal yang seru." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LatihanList,
});

function LatihanList() {
  const { practice } = useUserData();
  const best = new Map<string, number>();
  for (const p of practice) {
    const pct = Math.round((p.correct / p.total) * 100);
    best.set(p.topic_id, Math.max(best.get(p.topic_id) ?? 0, pct));
  }
  return (
    <div>
      <PageTitle emoji="🧩" title="Latihan Soal" subtitle={`Pilih topik. Setiap sesi berisi ${PRACTICE_LENGTH} soal baru!`} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LESSONS.map((l, i) => {
          const b = best.get(l.id);
          const stars = b === undefined ? 0 : b >= 100 ? 3 : b >= 60 ? 2 : 1;
          return (
            <li key={l.id} className="animate-pop-in" style={{ animationDelay: `${i * 40}ms` }}>
              <Link
                to="/latihan/$topicId"
                params={{ topicId: l.id }}
                className="pop-card group flex h-full flex-col items-center p-4 text-center transition-transform hover:-translate-y-1"
              >
                <span
                  className={cn(
                    "inline-flex size-16 items-center justify-center rounded-3xl text-3xl transition-transform group-hover:scale-110",
                    TONE_SOFT_BG[l.tone],
                  )}
                >
                  {l.emoji}
                </span>
                <h2 className="mt-2 font-display text-lg leading-tight font-bold">{l.short}</h2>
                <p className="mt-1 text-lg tracking-widest" aria-label={`${stars} dari 3 bintang`}>
                  {[0, 1, 2].map((s) => (
                    <span key={s} className={s < stars ? "" : "opacity-25 grayscale"}>
                      ⭐
                    </span>
                  ))}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {b === undefined ? "Belum dicoba" : `Terbaik ${b}%`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
