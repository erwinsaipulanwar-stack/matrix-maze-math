import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/use-user-data";
import { getLesson, lessonIndex, LESSONS, type LessonBlock } from "@/lib/lessons";
import { LESSON_POINTS } from "@/lib/progress";
import { TONE_BG, TONE_SOFT_BG } from "@/lib/avatars";
import { userDataQuery } from "@/lib/user-data";
import { MatrixView } from "@/components/MatrixView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/belajar/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.lessonId);
    if (!lesson) throw notFound();
    return { title: lesson.title, summary: lesson.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Mahtrix` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.title} — Mahtrix` },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Materi — Mahtrix" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="pop-card p-8 text-center">
      <p className="text-4xl">🤔</p>
      <p className="mt-2 font-display text-xl font-bold">Materi tidak ditemukan</p>
      <Button asChild className="mt-4">
        <Link to="/belajar">Kembali ke daftar materi</Link>
      </Button>
    </div>
  ),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId)!;
  const idx = lessonIndex(lessonId);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const { userId, doneLessons } = useUserData();
  const done = doneLessons.has(lesson.id);
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({ user_id: userId, lesson_id: lesson.id }, { onConflict: "user_id,lesson_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userDataQuery(userId).queryKey });
      toast.success(`Hebat! +${LESSON_POINTS} poin ⭐`, { description: `Materi "${lesson.title}" selesai.` });
    },
    onError: () => toast.error("Gagal menyimpan progres. Coba lagi, ya."),
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/belajar" className="mb-4 inline-flex items-center gap-1 font-display font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Semua materi
      </Link>

      <header className={cn("relative overflow-hidden rounded-4xl p-6 shadow-[0_6px_0_0_var(--border-shade)] sm:p-8", TONE_SOFT_BG[lesson.tone])}>
        <span className="absolute -top-4 -right-2 text-8xl opacity-25 sm:text-9xl" aria-hidden>
          {lesson.emoji}
        </span>
        <span className={cn("inline-block rounded-full px-3 py-1 font-display text-sm font-bold", TONE_BG[lesson.tone])}>
          Materi {idx + 1} dari {LESSONS.length}
        </span>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{lesson.title}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{lesson.summary}</p>
        {done && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 font-display text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" /> Sudah selesai
          </span>
        )}
      </header>

      <div className="mt-6 space-y-5">
        {lesson.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      <div className="pop-card mt-8 p-5 text-center">
        {done ? (
          <>
            <p className="font-display text-xl font-bold">Kamu sudah menguasai materi ini 🎉</p>
            <p className="text-muted-foreground">Yuk, uji dengan latihan soal!</p>
          </>
        ) : (
          <>
            <p className="font-display text-xl font-bold">Sudah paham materinya?</p>
            <p className="text-muted-foreground">Tandai selesai dan dapatkan {LESSON_POINTS} poin.</p>
          </>
        )}
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          {!done && (
            <Button size="lg" variant="success" onClick={() => complete.mutate()} disabled={complete.isPending}>
              {complete.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Aku sudah paham!
            </Button>
          )}
          <Button asChild size="lg" variant="sunny">
            <Link to="/latihan/$topicId" params={{ topicId: lesson.id }}>
              🧩 Latihan topik ini
            </Link>
          </Button>
        </div>
      </div>

      <nav className="mt-6 flex justify-between gap-3" aria-label="Navigasi materi">
        {prev ? (
          <Button asChild variant="outline">
            <Link to="/belajar/$lessonId" params={{ lessonId: prev.id }}>
              <ArrowLeft /> <span className="max-w-32 truncate sm:max-w-none">{prev.short}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button asChild variant="outline">
            <Link to="/belajar/$lessonId" params={{ lessonId: next.id }}>
              <span className="max-w-32 truncate sm:max-w-none">{next.short}</span> <ArrowRight />
            </Link>
          </Button>
        )}
      </nav>
    </article>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="text-lg leading-relaxed">{block.text}</p>;
    case "matrix":
      return (
        <figure className="pop-card px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 overflow-x-auto">
            {block.items.map((it, i) => (
              <MatrixView key={i} m={it.m} label={it.label} size="lg" />
            ))}
          </div>
          {block.caption && <figcaption className="mt-4 text-center font-semibold text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      );
    case "formula":
      return (
        <div className="rounded-3xl bg-foreground p-5 text-center text-background">
          <p className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{block.text}</p>
          {block.caption && <p className="mt-2 opacity-80">{block.caption}</p>}
        </div>
      );
    case "tip":
      return (
        <aside className="flex gap-3 rounded-3xl border-2 border-dashed border-sunny-shade bg-sunny-soft p-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sunny">
            <Lightbulb className="size-5" />
          </span>
          <p className="font-semibold">
            <span className="font-display font-bold">Tips Mixi: </span>
            {block.text}
          </p>
        </aside>
      );
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-card p-3 shadow-[0_3px_0_0_var(--border-shade)]">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-teal font-display text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-lg">{it}</span>
            </li>
          ))}
        </ul>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {block.items.map((it) => (
            <div key={it.name} className="pop-card flex items-center gap-4 p-4">
              <div className="flex min-w-24 justify-center">
                <MatrixView m={it.m} size="sm" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">{it.name}</p>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "example":
      return (
        <section className="overflow-hidden rounded-3xl border-2 border-teal bg-card shadow-[0_5px_0_0_var(--teal-shade)]">
          <div className="bg-teal px-4 py-2 font-display font-bold">✏️ Contoh Soal</div>
          <div className="p-4 sm:p-5">
            <p className="text-lg font-semibold">{block.title}</p>
            {block.items && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 overflow-x-auto rounded-2xl bg-muted/70 py-4">
                {block.items.map((it, i) => (
                  <MatrixView key={i} m={it.m} label={it.label} />
                ))}
              </div>
            )}
            <ol className="mt-4 space-y-2">
              {block.steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-display font-bold text-teal-shade">Langkah {i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            {block.result && (
              <div className="mt-4 flex justify-center rounded-2xl bg-teal-soft py-4">
                <MatrixView m={block.result.m} label={block.result.label} />
              </div>
            )}
          </div>
        </section>
      );
  }
}
