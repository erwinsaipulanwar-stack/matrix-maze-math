import { Check, X } from "lucide-react";
import type { Question } from "@/lib/questions";
import { MatrixView } from "./MatrixView";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  selected,
  onSelect,
  reveal = false,
  disabled = false,
  number,
}: {
  question: Question;
  selected: number | null;
  onSelect?: (i: number) => void;
  reveal?: boolean;
  disabled?: boolean;
  number?: number;
}) {
  const hasMatrixOptions = question.options.some((o) => o.kind === "matrix");
  return (
    <div className="animate-pop-in">
      <div className="pop-card p-5 sm:p-7">
        {number !== undefined && (
          <span className="mb-2 inline-block rounded-full bg-sunny-soft px-3 py-1 font-display text-sm font-semibold">
            Soal {number}
          </span>
        )}
        <h2 className="text-xl leading-snug font-semibold sm:text-2xl">{question.prompt}</h2>
        {question.matrices && question.matrices.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl bg-muted/70 px-3 py-5">
            {question.matrices.map((mx, i) => (
              <MatrixView key={i} m={mx.m} label={mx.label} />
            ))}
          </div>
        )}
      </div>

      <div className={cn("mt-4 grid gap-3", hasMatrixOptions ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {question.options.map((o, i) => {
          const isSelected = selected === i;
          const isCorrect = reveal && i === question.answer;
          const isWrong = reveal && isSelected && i !== question.answer;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(i)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex min-h-16 items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left transition-all duration-150",
                "shadow-[0_4px_0_0_var(--border-shade)] enabled:active:translate-y-[3px] enabled:active:shadow-none",
                hasMatrixOptions && "flex-col justify-center py-4",
                !reveal && isSelected && "border-sky bg-sky-soft shadow-[0_4px_0_0_var(--sky-shade)]",
                !reveal && !isSelected && "border-border enabled:hover:border-sky",
                isCorrect && "border-success bg-teal-soft shadow-[0_4px_0_0_var(--teal-shade)]",
                isWrong && "animate-wiggle border-destructive bg-coral-soft shadow-[0_4px_0_0_var(--coral-shade)]",
                reveal && !isCorrect && !isWrong && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-xl font-display font-bold",
                  hasMatrixOptions && "absolute top-2 left-2 size-7 text-sm",
                  isCorrect
                    ? "bg-success text-success-foreground"
                    : isWrong
                      ? "bg-destructive text-destructive-foreground"
                      : isSelected
                        ? "bg-sky text-primary-foreground"
                        : "bg-muted",
                )}
              >
                {isCorrect ? <Check className="size-4" /> : isWrong ? <X className="size-4" /> : LETTERS[i]}
              </span>
              {o.kind === "text" ? (
                <span className="font-display text-lg font-semibold">{o.text}</span>
              ) : (
                <MatrixView m={o.m} size="sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
