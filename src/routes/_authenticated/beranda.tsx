import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { LESSONS } from "@/lib/lessons";
import { AvatarBubble } from "@/components/Avatar";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { TONE_SOFT_BG } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import mascot from "@/assets/mascot-wave.png";

export const Route = createFileRoute("/_authenticated/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda — Mahtrix" },
      { name: "description", content: "Lihat poin, level, dan progres belajar matriksmu di Mahtrix." },
      { property: "og:title", content: "Beranda — Mahtrix" },
      { property: "og:description", content: "Ringkasan progres belajar matriksmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Beranda,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function Beranda() {
  const { profile, points, level, doneLessons, badges, practice, bestEval, evaluations } = useUserData();
  const next = LESSONS.find((l) => !doneLessons.has(l.id));
  const lessonPct = Math.round((doneLessons.size / LESSONS.length) * 100);
  const unlocked = badges.filter((b) => b.unlocked);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-4xl bg-sunrise p-5 shadow-[0_6px_0_0_var(--border-shade)] sm:p-8">
        <img
          src={mascot}
          alt=""
          width={1024}
          height={1024}
          className="absolute -right-6 -bottom-8 w-36 animate-float sm:w-52"
        />
        <div className="relative max-w-[65%] sm:max-w-md">
          <div className="flex items-center gap-3">
            <AvatarBubble id={profile?.avatar} size="lg" />
            <div>
              <p className="font-semibold text-muted-foreground">{greeting()},</p>
              <h1 className="text-3xl font-bold sm:text-4xl">{profile?.nickname ?? "Teman"}!</h1>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-card/80 p-3 backdrop-blur">
            <div className="flex items-center justify-between font-display font-semibold">
              <span>
                {level.emoji} {level.name}
              </span>
              <span className="text-sm text-muted-foreground">⭐ {points}</span>
            </div>
            <ProgressBar value={level.progress} className="mt-2" barClassName="bg-coral" label="Progres level" />
            <p className="mt-1 text-xs text-muted-foreground">
              {level.next ? `${level.next.min - points} poin lagi menuju ${level.next.name}` : "Level tertinggi! Keren!"}
            </p>
          </div>
        </div>
      </section>

      {next ? (
        <Link
          to="/belajar/$lessonId"
          params={{ lessonId: next.id }}
          className="pop-card group flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className={cn("inline-flex size-14 items-center justify-center rounded-2xl text-3xl", TONE_SOFT_BG[next.tone])}>
            {next.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-muted-foreground">Lanjutkan belajar</p>
            <p className="truncate font-display text-xl font-bold">{next.title}</p>
          </div>
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-coral text-primary-foreground shadow-[0_3px_0_0_var(--coral-shade)] transition-transform group-hover:translate-x-1">
            <ArrowRight className="size-5" />
          </span>
        </Link>
      ) : (
        <div className="pop-card flex items-center gap-4 p-4">
          <span className="text-4xl">🎉</span>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">Semua materi selesai!</p>
            <p className="text-muted-foreground">Saatnya uji kemampuan di evaluasi.</p>
          </div>
          <Button asChild variant="teal">
            <Link to="/evaluasi">Evaluasi</Link>
          </Button>
        </div>
      )}

      <section className="grid grid-cols-3 gap-3" aria-label="Statistik">
        <Stat emoji="📖" value={`${doneLessons.size}/${LESSONS.length}`} label="Materi" tone="bg-coral-soft" />
        <Stat emoji="🧩" value={String(practice.length)} label="Latihan" tone="bg-sunny-soft" />
        <Stat emoji="📝" value={evaluations.length ? String(bestEval) : "–"} label="Nilai terbaik" tone="bg-teal-soft" />
      </section>

      <section className="pop-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Progres materi</h2>
          <span className="font-display font-bold text-teal-shade">{lessonPct}%</span>
        </div>
        <ProgressBar value={lessonPct} className="mt-3" label="Progres materi" />
        <div className="mt-4 flex flex-wrap gap-2">
          {LESSONS.map((l, i) => (
            <Link
              key={l.id}
              to="/belajar/$lessonId"
              params={{ lessonId: l.id }}
              title={l.title}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl border-2 font-display font-bold transition-transform hover:scale-110",
                doneLessons.has(l.id) ? "border-teal bg-teal text-accent-foreground" : "border-border bg-card text-muted-foreground",
              )}
            >
              {doneLessons.has(l.id) ? "✓" : i + 1}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MenuCard to="/belajar" emoji="📖" title="Belajar" text="Baca materi matriks" tone="bg-coral" />
        <MenuCard to="/latihan" emoji="🧩" title="Latihan" text="Asah kemampuanmu" tone="bg-sunny" />
        <MenuCard to="/evaluasi" emoji="📝" title="Evaluasi" text="Uji pemahamanmu" tone="bg-teal" />
      </section>

      <section className="pop-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Lencana</h2>
          <Link to="/profil" className="font-display font-semibold text-coral">
            Lihat semua
          </Link>
        </div>
        {unlocked.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Belum ada lencana. Selesaikan materi pertamamu untuk dapat 🐣!</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {unlocked.map((b) => (
              <span key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1.5 font-display font-semibold">
                {b.emoji} {b.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ emoji, value, label, tone }: { emoji: string; value: string; label: string; tone: string }) {
  return (
    <div className={cn("rounded-3xl p-3 text-center sm:p-4", tone)}>
      <div className="text-2xl">{emoji}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}

function MenuCard({
  to,
  emoji,
  title,
  text,
  tone,
}: {
  to: "/belajar" | "/latihan" | "/evaluasi";
  emoji: string;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-3xl p-4 shadow-[0_5px_0_0_var(--border-shade)] transition-transform hover:-translate-y-1 sm:flex-col sm:items-start",
        tone,
      )}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-card text-2xl">{emoji}</span>
      <div>
        <p className="font-display text-xl font-bold">{title}</p>
        <p className="text-sm font-semibold opacity-80">{text}</p>
      </div>
    </Link>
  );
}
