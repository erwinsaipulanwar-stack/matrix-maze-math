import { AVATARS, TONE_SOFT_BG } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Pilih avatar">
      {AVATARS.map((a) => {
        const active = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={a.name}
            onClick={() => onChange(a.id)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl transition-all sm:text-3xl",
              TONE_SOFT_BG[a.tone],
              active
                ? "scale-110 border-coral shadow-[0_3px_0_0_var(--coral-shade)]"
                : "border-transparent hover:scale-105",
            )}
          >
            {a.emoji}
          </button>
        );
      })}
    </div>
  );
}
