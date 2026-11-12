import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { LESSONS } from "@/lib/lessons";
import { TONE_SOFT_BG } from "@/lib/avatars";
import { PageTitle } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/belajar/")({
  head: () => ({
    meta: [
      { title: "Materi Matriks — Mahtrix" },
      { name: "description", content: "Sembilan materi matriks SMA: ordo, jenis, transpose, operasi, determinan, invers, dan persamaan." },
      { property: "og:title", content: "Materi Matriks — Mahtrix" },
      { property: "og:description", content: "Pelajari matriks langkah demi langkah dengan contoh bergambar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BelajarList,
});

function BelajarList() {
  const { doneLessons } = useUserData();
  const pct = Math.round((doneLessons.size / LESSONS.length) * 100);
  return (
    <div>
      <PageTitle emoji="📖" title="Belajar" subtitle="Pilih materi, baca pelan-pelan, lalu tandai selesai." />
      <div className="pop-card mb-5 flex items-center gap-4 p-4">
        <div className="flex-1">
          <p className="font-display font-semibold">
            {doneLessons.size} dari {LESSONS.length} materi selesai
          </p>
          <ProgressBar value={pct} className="mt-2" label="Progres materi" />
        </div>
        <span className="font-display text-3xl font-bold text-teal-shade">{pct}%</span>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {LESSONS.map((l, i) => {
          const done = doneLessons.has(l.id);
          return (
            <li key={l.id} className="animate-pop-in" style={{ animationDelay: `${i * 40}ms` }}>
              <Link
                to="/belajar/$lessonId"
                params={{ lessonId: l.id }}
                className="pop-card group flex h-full items-center gap-4 p-4 transition-transform hover:-translate-y-1"
              >
                <span
                  className={cn(
                    "relative inline-flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:rotate-[-6deg]",
                    TONE_SOFT_BG[l.tone],
                  )}
                >
                  {l.emoji}
                  {done && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-card bg-success text-success-foreground">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-muted-foreground">Materi {i + 1}</p>
                  <h2 className="font-display text-lg leading-tight font-bold">{l.title}</h2>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
