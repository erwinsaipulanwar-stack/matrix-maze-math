import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Flag, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/use-user-data";
import {
  EVALUATION_PLAN,
  EVALUATION_TIME_SECONDS,
  generateEvaluation,
  PASSING_SCORE,
  type Question,
} from "@/lib/questions";
import { EVALUATION_POINTS_PER_CORRECT, scoreFrom } from "@/lib/progress";
import { getLesson } from "@/lib/lessons";
import { userDataQuery } from "@/lib/user-data";
import { PageTitle } from "@/components/AppShell";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import mascotCheer from "@/assets/mascot-cheer.png";
import mascotWave from "@/assets/mascot-wave.png";

export const Route = createFileRoute("/_authenticated/evaluasi")({
  head: () => ({
    meta: [
      { title: "Evaluasi Matriks — Mahtrix" },
      { name: "description", content: "Evaluasi 15 soal campuran materi matriks dengan batas waktu dan pembahasan lengkap." },
      { property: "og:title", content: "Evaluasi Matriks — Mahtrix" },
      { property: "og:description", content: "Uji pemahaman matriksmu dan raih nilai terbaik." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EvaluasiPage,
});

type Phase = "intro" | "running" | "done";

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function EvaluasiPage() {
  const { userId, evaluations, bestEval } = useUserData();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(EVALUATION_TIME_SECONDS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ correct: number; score: number; duration: number } | null>(null);
  const startedAt = useRef(0);

  const save = useMutation({
    mutationFn: async (r: { correct: number; score: number; duration: number }) => {
      const { error } = await supabase.from("evaluation_attempts").insert({
        user_id: userId,
        correct: r.correct,
        total: EVALUATION_PLAN.length,
        score: r.score,
        duration_seconds: r.duration,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userDataQuery(userId).queryKey }),
    onError: () => toast.error("Nilai evaluasi gagal disimpan. Periksa koneksimu."),
  });

  const start = () => {
    const qs = generateEvaluation();
    setQuestions(qs);
    setAnswers(qs.map(() => null));
    setIdx(0);
    setRemaining(EVALUATION_TIME_SECONDS);
    setResult(null);
    startedAt.current = Date.now();
    setPhase("running");
    window.scrollTo({ top: 0 });
  };

  const submit = useCallback(() => {
    setConfirmOpen(false);
    const correct = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    const duration = Math.min(EVALUATION_TIME_SECONDS, Math.round((Date.now() - startedAt.current) / 1000));
    const r = { correct, score: scoreFrom(correct, questions.length), duration };
    setResult(r);
    setPhase("done");
    save.mutate(r);
    window.scrollTo({ top: 0 });
  }, [questions, answers, save]);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      const left = EVALUATION_TIME_SECONDS - Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, left));
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && remaining === 0) {
      toast("Waktu habis! ⏰ Jawabanmu dikumpulkan otomatis.");
      submit();
    }
  }, [remaining, phase, submit]);

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageTitle emoji="📝" title="Evaluasi" subtitle="Uji pemahamanmu tentang semua materi matriks." />
        <div className="pop-card overflow-hidden">
          <div className="flex items-center gap-4 bg-teal-soft p-5">
            <img src={mascotWave} alt="" width={1024} height={1024} className="w-24 animate-float" />
            <div>
              <p className="font-display text-xl font-bold">Siap untuk tantangan?</p>
              <p className="text-muted-foreground">Kerjakan dengan tenang dan teliti, ya!</p>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-2 p-5 text-center">
            <li className="rounded-2xl bg-coral-soft p-3">
              <p className="font-display text-2xl font-bold">{EVALUATION_PLAN.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">soal</p>
            </li>
            <li className="rounded-2xl bg-sunny-soft p-3">
              <p className="font-display text-2xl font-bold">{EVALUATION_TIME_SECONDS / 60}</p>
              <p className="text-xs font-semibold text-muted-foreground">menit</p>
            </li>
            <li className="rounded-2xl bg-sky-soft p-3">
              <p className="font-display text-2xl font-bold">{PASSING_SCORE}</p>
              <p className="text-xs font-semibold text-muted-foreground">nilai lulus</p>
            </li>
          </ul>
          <div className="px-5 pb-5">
            <Button size="xl" className="w-full" onClick={start}>
              Mulai Evaluasi 🚀
            </Button>
          </div>
        </div>

        <section className="pop-card mt-5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Riwayat nilai</h2>
            {evaluations.length > 0 && (
              <span className="rounded-full bg-sunny-soft px-3 py-1 font-display text-sm font-semibold">
                Terbaik: {bestEval}
              </span>
            )}
          </div>
          {evaluations.length === 0 ? (
            <p className="mt-2 text-muted-foreground">Belum ada evaluasi. Nilai pertamamu akan muncul di sini.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {evaluations.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-2.5">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {e.correct}/{e.total} benar
                  </span>
                  <span
                    className={cn(
                      "rounded-xl px-2.5 py-0.5 font-display text-lg font-bold",
                      e.score >= PASSING_SCORE ? "bg-teal" : "bg-coral-soft text-coral-shade",
                    )}
                  >
                    {e.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  if (phase === "done" && result) {
    const passed = result.score >= PASSING_SCORE;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="pop-card animate-pop-in p-6 text-center sm:p-8">
          <img src={passed ? mascotCheer : mascotWave} alt="" width={1024} height={1024} className="mx-auto w-40 animate-bounce-soft" />
          <h1 className="mt-2 text-3xl font-bold">{passed ? "Selamat, kamu lulus! 🏅" : "Ayo coba lagi! 💪"}</h1>
          <p className="text-muted-foreground">
            {result.correct} dari {questions.length} soal benar · waktu {fmtTime(result.duration)}
          </p>
          <p
            className={cn(
              "mx-auto mt-5 inline-flex size-32 items-center justify-center rounded-full font-display text-5xl font-bold shadow-[0_6px_0_0_var(--border-shade)]",
              passed ? "bg-teal" : "bg-coral-soft text-coral-shade",
            )}
          >
            {result.score}
          </p>
          <p className="mt-3 font-display text-lg font-semibold text-sunny-shade">
            +{result.correct * EVALUATION_POINTS_PER_CORRECT} poin ⭐
          </p>
          <p className="text-xs text-muted-foreground">
            {save.isPending ? "Menyimpan…" : save.isSuccess ? "Nilai tersimpan ✓" : save.isError ? "Gagal menyimpan" : ""}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={start}>
              <RotateCcw /> Coba lagi
            </Button>
            <Button size="lg" variant="outline" onClick={() => setPhase("intro")}>
              Selesai
            </Button>
          </div>
        </div>

        <h2 className="mt-8 mb-3 text-2xl font-bold">Pembahasan</h2>
        <div className="space-y-8">
          {questions.map((q, i) => {
            const right = answers[i] === q.answer;
            return (
              <div key={q.id}>
                <QuestionCard question={q} selected={answers[i] ?? null} reveal disabled number={i + 1} />
                <div className={cn("mt-3 rounded-2xl p-4", right ? "bg-teal-soft" : "bg-coral-soft")}>
                  <p className="font-display font-bold">
                    {right ? "✅ Benar" : answers[i] === null ? "⏭️ Tidak dijawab" : "❌ Kurang tepat"}
                    <span className="ml-2 text-sm font-semibold text-muted-foreground">· {getLesson(q.topicId)?.short}</span>
                  </p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[idx]!;
  const answeredCount = answers.filter((a) => a !== null).length;
  const lowTime = remaining <= 60;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-display font-semibold">
          {answeredCount}/{questions.length} terjawab
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-bold tabular-nums",
            lowTime ? "animate-wiggle bg-coral text-primary-foreground" : "bg-card shadow-[0_3px_0_0_var(--border-shade)]",
          )}
          aria-live="polite"
        >
          <Clock className="size-4" /> {fmtTime(remaining)}
        </span>
      </div>

      <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-2">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Soal ${i + 1}`}
              aria-current={i === idx}
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border-2 font-display font-bold transition-all",
                i === idx
                  ? "border-sky bg-sky text-primary-foreground"
                  : answers[i] !== null
                    ? "border-teal bg-teal-soft"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <QuestionCard
        key={q.id}
        question={q}
        number={idx + 1}
        selected={answers[idx] ?? null}
        onSelect={(choice) => setAnswers((a) => a.map((v, i) => (i === idx ? choice : v)))}
      />

      <div className="sticky bottom-24 z-20 mt-5 flex gap-3 md:bottom-4">
        <Button size="lg" variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} aria-label="Soal sebelumnya">
          <ArrowLeft />
        </Button>
        {idx < questions.length - 1 ? (
          <Button size="lg" variant="sky" className="flex-1" onClick={() => setIdx((i) => i + 1)}>
            Soal berikutnya <ArrowRight />
          </Button>
        ) : (
          <Button size="lg" variant="success" className="flex-1" onClick={() => setConfirmOpen(true)}>
            <Flag /> Kumpulkan
          </Button>
        )}
      </div>
      {idx < questions.length - 1 && (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-4 w-full text-center font-display font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          Kumpulkan sekarang
        </button>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">Kumpulkan jawaban?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {answeredCount < questions.length
                ? `Masih ada ${questions.length - answeredCount} soal yang belum dijawab. Yakin mau dikumpulkan?`
                : "Semua soal sudah dijawab. Siap melihat nilaimu?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cek lagi</AlertDialogCancel>
            <AlertDialogAction className="rounded-2xl bg-success text-success-foreground" onClick={submit}>
              Kumpulkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
