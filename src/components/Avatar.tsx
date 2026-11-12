import { getAvatar, TONE_SOFT_BG } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-9 text-xl",
  md: "size-12 text-2xl",
  lg: "size-20 text-5xl",
  xl: "size-28 text-7xl",
};

export function AvatarBubble({
  id,
  size = "md",
  className,
}: {
  id: string | null | undefined;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const a = getAvatar(id);
  return (
    <span
      role="img"
      aria-label={`Avatar ${a.name}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-card shadow-float",
        TONE_SOFT_BG[a.tone],
        SIZES[size],
        className,
      )}
    >
      {a.emoji}
    </span>
  );
}
