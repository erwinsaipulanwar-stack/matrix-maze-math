import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/hooks/use-user-data";
import { getLesson } from "@/lib/lessons";
import { generatePractice, PRACTICE_LENGTH, type Question } from "@/lib/questions";
import { PRACTICE_POINTS_PER_CORRECT } from "@/lib/progress";
import { userDataQuery } from "@/lib/user-data";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import mascotCheer from "@/assets/mascot-cheer.png";
import mascotWave from "@/assets/mascot-wave.png";

export const Route = createFileRoute("/_authenticated/latihan/$topicId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.topicId);
    if (!lesson) throw notFound();
    return { title: lesson.title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Latihan ${loaderData.title} — Mahtrix` },
          { name: "description", content: `Latihan soal ${loaderData.title} dengan pembahasan langsung.` },
          { property: "og:title", content: `Latihan ${loaderData.title} — Mahtrix` },
          { property: "og:description", content: `Uji pemahamanmu tentang ${loaderData.title}.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Latihan — Mahtrix" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="pop-card p-8 text-center">
      <p className="text-4xl">🤔</p>
      <p className="mt-2 font-display text-xl font-bold">Topik tidak ditemukan</p>
      <Button asChild className="mt-4">
        <Link to="/latihan">Kembali ke latihan</Link>
      </Button>
    </div>
  ),
  component: PracticePage,
});

const PRAISE = ["Mantap! 🎉", "Keren banget! 🌟", "Betul sekali! 💯", "Hebat! 🚀", "Jago! 🔥"];
const ENCOURAGE = ["Hampir! Ayo coba pahami 💪", "Tidak apa-apa, kita belajar 🌱", "Semangat! Lihat pembahasannya 👀"];

function PracticePage() {
  const { topicId } = Route.useParams();
  const lesson = getLesson(topicId)!;
  const userId = useUserId();
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<Question[]>(() => generatePractice(topicId));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const save = useMutation({
    mutationFn: async (score: number) => {
      const { error } = await supabase
        .from("practice_attempts")
        .insert({ user_id: userId, topic_id: topicId, correct: score, total: PRACTICE_LENGTH });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userDataQuery(userId).queryKey }),
    onError: () => toast.error("Hasil latihan gagal disimpan. Periksa koneksimu."),
  });

  const q = questions[idx]!;
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (checked) feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [checked]);
  const isRight = checked && selected === q.answer;

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (selected === q.answer) setCorrect((c) => c + 1);
  }

  function nextQuestion() {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      save.mutate(correct);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }

  function restart() {
    setQuestions(generatePractice(topicId));
    setIdx(0);
    setSelected(null);
    setChecked(false);
    setCorrect(0);
    setFinished(false);
  }

  if (finished) {
    const great = correct >= Math.ceil(PRACTICE_LENGTH * 0.8);
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="pop-card animate-pop-in p-6 sm:p-8">
          <img
            src={great ? mascotCheer : mascotWave}
            alt=""
            width={1024}
            height={1024}
            className="mx-auto w-40 animate-bounce-soft"
          />
          <h1 className="mt-2 text-3xl font-bold">{great ? "Luar biasa!" : correct >= 3 ? "Bagus!" : "Terus berlatih!"}</h1>
          <p className="mt-1 text-muted-foreground">Latihan {lesson.title}</p>
          <p className="mt-5 font-display text-6xl font-bold">
            {correct}
            <span className="text-3xl text-muted-foreground">/{PRACTICE_LENGTH}</span>
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-sunny-shade">
            +{correct * PRACTICE_POINTS_PER_CORRECT} poin ⭐
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {save.isPending ? "Menyimpan…" : save.isSuccess ? "Progres tersimpan ✓" : save.isError ? "Gagal menyimpan" : ""}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" onClick={restart}>
              <RotateCcw /> Main lagi (soal baru)
            </Button>
            {!great && (
              <Button asChild size="lg" variant="sunny">
                <Link to="/belajar/$lessonId" params={{ lessonId: lesson.id }}>
                  <BookOpen /> Baca materi lagi
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="/latihan">Pilih topik lain</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/latihan" aria-label="Kembali" className="inline-flex size-10 items-center justify-center rounded-xl bg-card shadow-[0_3px_0_0_var(--border-shade)]">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <div className="flex justify-between font-display text-sm font-semibold">
            <span>
              {lesson.emoji} {lesson.short}
            </span>
            <span>
              {idx + 1}/{questions.length}
            </span>
          </div>
          <ProgressBar value={((idx + (checked ? 1 : 0)) / questions.length) * 100} className="mt-1" barClassName="bg-sunny" label="Progres latihan" />
        </div>
      </div>

      <QuestionCard
        key={q.id}
        question={q}
        selected={selected}
        onSelect={(i) => !checked && setSelected(i)}
        reveal={checked}
        disabled={checked}
      />

      <div
        ref={feedbackRef}
        className={cn(
          "mt-5 scroll-mb-28 rounded-3xl p-4 transition-colors md:scroll-mb-6",
          !checked && "sticky bottom-24 z-20 bg-transparent md:bottom-4",
          checked && isRight && "animate-pop-in bg-teal-soft shadow-[0_4px_0_0_var(--teal-shade)]",
          checked && !isRight && "animate-pop-in bg-coral-soft shadow-[0_4px_0_0_var(--coral-shade)]",
        )}
        aria-live="polite"
      >
        {checked && (
          <div className="mb-3">
            <p className="font-display text-xl font-bold">
              {isRight ? PRAISE[idx % PRAISE.length] : ENCOURAGE[idx % ENCOURAGE.length]}
            </p>
            <p className="mt-1">{q.explanation}</p>
          </div>
        )}
        {checked ? (
          <Button size="lg" className="w-full" variant={isRight ? "success" : "default"} onClick={nextQuestion}>
            {idx + 1 >= questions.length ? "Lihat hasil" : "Lanjut"} <ArrowRight />
          </Button>
        ) : (
          <Button size="lg" className="w-full" variant="sky" disabled={selected === null} onClick={check}>
            Periksa jawaban
          </Button>
        )}
      </div>
    </div>
  );
}
