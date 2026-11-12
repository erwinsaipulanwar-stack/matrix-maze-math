import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-display text-2xl font-bold", className)}>
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-coral text-primary-foreground shadow-[0_3px_0_0_var(--coral-shade)]">
        [ ]
      </span>
      <span>
        Mah<span className="text-coral">trix</span>
      </span>
    </span>
  );
}
